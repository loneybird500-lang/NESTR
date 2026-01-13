
import os
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory, abort, g, url_for
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, 'NESTR PROJECT')
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_FILE = os.path.join(DATA_DIR, 'app.db')
IMAGES_DIR = os.path.join(FRONTEND_DIR, 'nestr images')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Simple in-memory token -> user_id mapping for dev
TOKENS = {}


def ensure_dirs():
	os.makedirs(DATA_DIR, exist_ok=True)
	os.makedirs(IMAGES_DIR, exist_ok=True)


def get_db():
	db = getattr(g, '_database', None)
	if db is None:
		db = g._database = sqlite3.connect(DB_FILE)
		db.row_factory = sqlite3.Row
	return db


def query_db(query, args=(), one=False, commit=False):
	db = get_db()
	cur = db.execute(query, args)
	try:
		if commit:
			db.commit()
			return cur.lastrowid
		rv = cur.fetchall()
		return (rv[0] if rv else None) if one else rv
	finally:
		try:
			cur.close()
		except Exception:
			pass


def init_db():
	ensure_dirs()
	if not os.path.exists(DB_FILE):
		db = sqlite3.connect(DB_FILE)
		cur = db.cursor()
		# users table
		cur.execute('''
			CREATE TABLE users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT,
				email TEXT UNIQUE,
				password TEXT,
				role TEXT,
				phone TEXT,
				created_at TEXT
			)
		''')
		# properties table
		cur.execute('''
			CREATE TABLE properties (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT,
				description TEXT,
				price INTEGER,
				type TEXT,
				bedrooms INTEGER,
				bathrooms INTEGER,
				state TEXT,
				city TEXT,
				area TEXT,
				address TEXT,
				landlord_id INTEGER,
				landlord_name TEXT,
				contact TEXT,
				created_at TEXT,
				status TEXT DEFAULT 'available',
				views INTEGER DEFAULT 0
			)
		''')
		# images table
		cur.execute('''
			CREATE TABLE images (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				property_id INTEGER,
				filename TEXT
			)
		''')
		# likes table
		cur.execute('''
			CREATE TABLE likes (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				property_id INTEGER,
				user_id INTEGER
			)
		''')

		# seed demo users and property
		now = datetime.utcnow().strftime('%Y-%m-%d')
		cur.execute('INSERT INTO users (name,email,password,role,phone,created_at) VALUES (?,?,?,?,?,?)',
					('Demo Student','student@demo.com','demo123','tenant','+2348012345678', now))
		cur.execute('INSERT INTO users (name,email,password,role,phone,created_at) VALUES (?,?,?,?,?,?)',
					('Demo Landlord','landlord@demo.com','demo123','landlord','+2348098765432', now))
		landlord_id = cur.lastrowid
		cur.execute('INSERT INTO properties (title,description,price,type,bedrooms,bathrooms,state,city,area,address,landlord_id,landlord_name,contact,created_at,status,views) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
					('Spacious 2-Bedroom Apartment near UNIBEN','Well-furnished apartment with constant water and electricity. Close to University of Benin. 24/7 security.',180000,'apartment',2,2,'Edo','Benin City','Ugbowo','Ugbowo Road',landlord_id,'Demo Landlord','+2348098765432', now,'available',0))

		db.commit()
		cur.close()
		db.close()


@app.teardown_appcontext
def close_connection(exception):
	db = getattr(g, '_database', None)
	if db is not None:
		db.close()


# Global exception handler to return JSON and log unexpected errors
@app.errorhandler(Exception)
def handle_unexpected_error(e):
	app.logger.exception('Unhandled exception')
	return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@app.route('/')
def serve_index():
	index_path = os.path.join(FRONTEND_DIR, 'index.html')
	if os.path.exists(index_path):
		return send_from_directory(FRONTEND_DIR, 'index.html')
	return 'Frontend not found', 404


@app.route('/<path:path>')
def serve_static(path):
	full = os.path.join(FRONTEND_DIR, path)
	if os.path.exists(full):
		return send_from_directory(FRONTEND_DIR, path)
	return abort(404)


def authenticate_request(req):
	auth = req.headers.get('Authorization') or req.args.get('token')
	if not auth:
		app.logger.debug('authenticate_request: no Authorization header or token param')
		return None
	if auth.lower().startswith('bearer '):
		token = auth.split(None, 1)[1]
	else:
		token = auth
	user_id = TOKENS.get(token)
	if user_id is None:
		app.logger.debug('authenticate_request: token provided but no matching user_id in TOKENS')
		return None
	row = query_db('SELECT * FROM users WHERE id = ?', (user_id,), one=True)
	return dict(row) if row else None


@app.route('/api/auth/register', methods=['POST'])
def api_register():
	data = request.get_json() or {}
	email = (data.get('email') or '').strip().lower()
	app.logger.debug('Register attempt for email: %s', email)
	try:
		exists = query_db('SELECT id FROM users WHERE email = ?', (email,), one=True)
		if exists:
			app.logger.debug('Register failed: email exists %s', email)
			return jsonify({'error': 'User with this email already exists'}), 400
		name = data.get('name') or f'User{int(datetime.utcnow().timestamp())}'
		pwd = data.get('password') or ''
		role = data.get('role') or 'tenant'
		phone = data.get('phone') or ''
		created_at = datetime.utcnow().strftime('%Y-%m-%d')
		uid = query_db('INSERT INTO users (name,email,password,role,phone,created_at) VALUES (?,?,?,?,?,?)', (name, email, pwd, role, phone, created_at), commit=True)
		token = f"{uid}-{int(datetime.utcnow().timestamp())}"
		TOKENS[token] = uid
		user = query_db('SELECT id,name,email,role,phone,created_at FROM users WHERE id = ?', (uid,), one=True)
		app.logger.debug('Register success for email %s id %s', email, uid)
		return jsonify({'user': dict(user), 'token': token})
	except Exception as e:
		app.logger.exception('Registration error for %s', email)
		return jsonify({'error': 'Registration failed', 'message': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def api_login():
	data = request.get_json() or {}
	email = (data.get('email') or '').strip().lower()
	pwd = data.get('password') or ''
	app.logger.debug('Login attempt for email: %s', email)
	try:
		user = query_db('SELECT * FROM users WHERE lower(email) = ? AND password = ?', (email, pwd), one=True)
		if not user:
			app.logger.debug('Login failed for email %s: invalid credentials', email)
			return jsonify({'error': 'Invalid credentials'}), 401
		uid = user['id']
		token = f"{uid}-{int(datetime.utcnow().timestamp())}"
		TOKENS[token] = uid
		user_out = query_db('SELECT id,name,email,role,phone,created_at FROM users WHERE id = ?', (uid,), one=True)
		app.logger.debug('Login success for email %s id %s', email, uid)
		return jsonify({'user': dict(user_out), 'token': token})
	except Exception as e:
		app.logger.exception('Login error for %s', email)
		return jsonify({'error': 'Login failed', 'message': str(e)}), 500


@app.route('/api/users/me', methods=['GET'])
def api_me():
	user = authenticate_request(request)
	if not user:
		return jsonify({'error': 'Unauthorized'}), 401
	user_out = {k: user[k] for k in user if k != 'password'}
	return jsonify({'user': user_out})


@app.route('/api/debug/whoami', methods=['GET'])
def api_debug_whoami():
	"""Debug endpoint: returns current Authorization header and resolved user (if any).
	Use this from the browser to confirm the header is sent and token resolves to a user.
	"""
	auth_header = request.headers.get('Authorization')
	user = authenticate_request(request)
	user_out = None
	if user:
		user_out = {k: user[k] for k in user if k != 'password'}
	return jsonify({'authorization_header': auth_header, 'user': user_out})


def build_property_dict(row):
	p = dict(row)
	imgs = query_db('SELECT filename FROM images WHERE property_id = ?', (p['id'],))
	p['images'] = [i['filename'] for i in imgs]
	likes = query_db('SELECT user_id FROM likes WHERE property_id = ?', (p['id'],))
	p['likes'] = [l['user_id'] for l in likes]
	return p


@app.route('/api/properties', methods=['GET'])
def api_get_properties():
	args = request.args
	base_query = 'SELECT * FROM properties'
	rows = query_db(base_query)
	props = [build_property_dict(r) for r in rows]
	# apply filters in Python (simple)
	q = args.get('search')
	if q:
		ql = q.lower()
		props = [p for p in props if ql in (p.get('title','').lower() + p.get('description','').lower() + p.get('area','').lower() + p.get('city','').lower() + p.get('state','').lower())]
	state = args.get('state')
	if state and state != 'all':
		props = [p for p in props if p.get('state') == state]
	city = args.get('city')
	if city and city != 'all':
		props = [p for p in props if p.get('city') == city]
	ptype = args.get('type')
	if ptype and ptype != 'all':
		props = [p for p in props if p.get('type') == ptype]
	try:
		minp = int(args.get('minPrice')) if args.get('minPrice') else None
		maxp = int(args.get('maxPrice')) if args.get('maxPrice') else None
	except Exception:
		minp = maxp = None
	if minp is not None:
		props = [p for p in props if p.get('price',0) >= minp]
	if maxp is not None:
		props = [p for p in props if p.get('price',0) <= maxp]
	try:
		beds = int(args.get('bedrooms')) if args.get('bedrooms') else None
	except Exception:
		beds = None
	if beds is not None:
		props = [p for p in props if p.get('bedrooms',0) >= beds]
	return jsonify({'properties': props})


@app.route('/api/properties/<int:pid>', methods=['GET'])
def api_get_property(pid):
	row = query_db('SELECT * FROM properties WHERE id = ?', (pid,), one=True)
	if not row:
		return jsonify({'error': 'Not found'}), 404
	# increment views
	query_db('UPDATE properties SET views = views + 1 WHERE id = ?', (pid,), commit=True)
	prop = build_property_dict(row)
	return jsonify({'property': prop})


@app.route('/api/properties', methods=['POST'])
def api_create_property():
	user = authenticate_request(request)
	if not user:
		return jsonify({'error': 'Unauthorized'}), 401
	if user.get('role') != 'landlord':
		return jsonify({'error': 'Only landlords can create properties'}), 403
	data = request.get_json() or {}
	created_at = datetime.utcnow().strftime('%Y-%m-%d')
	pid = query_db('INSERT INTO properties (title,description,price,type,bedrooms,bathrooms,state,city,area,address,landlord_id,landlord_name,contact,created_at,status,views) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
				   (data.get('title',''), data.get('description',''), data.get('price',0), data.get('type',''), data.get('bedrooms',0), data.get('bathrooms',0), data.get('state',''), data.get('city',''), data.get('area',''), data.get('address',''), user['id'], user.get('name',''), data.get('contact', user.get('phone','')), created_at, 'available', 0), commit=True)
	# images can be saved via /api/upload endpoint and associated with property_id
	row = query_db('SELECT * FROM properties WHERE id = ?', (pid,), one=True)
	return jsonify({'property': build_property_dict(row)}), 201


@app.route('/api/properties/<int:pid>/like', methods=['POST'])
def api_like_property(pid):
	user = authenticate_request(request)
	if not user:
		return jsonify({'error': 'Unauthorized'}), 401
	exists = query_db('SELECT id FROM properties WHERE id = ?', (pid,), one=True)
	if not exists:
		return jsonify({'error': 'Not found'}), 404
	# toggle
	cur = query_db('SELECT id FROM likes WHERE property_id = ? AND user_id = ?', (pid, user['id']), one=True)
	if cur:
		query_db('DELETE FROM likes WHERE id = ?', (cur['id'],), commit=True)
		action = 'unliked'
	else:
		query_db('INSERT INTO likes (property_id, user_id) VALUES (?,?)', (pid, user['id']), commit=True)
		action = 'liked'
	row = query_db('SELECT * FROM properties WHERE id = ?', (pid,), one=True)
	return jsonify({'property': build_property_dict(row), 'action': action})


@app.route('/api/upload', methods=['POST'])
def api_upload():
	# Accept multipart/form-data file upload; optional property_id to associate
	try:
		user = authenticate_request(request)
		if not user:
			return jsonify({'error': 'Unauthorized'}), 401
		if 'file' not in request.files:
			return jsonify({'error': 'No file provided'}), 400
		f = request.files['file']
		if f.filename == '':
			return jsonify({'error': 'Empty filename'}), 400
		# secure filename basic
		filename = f.filename.replace('..', '').replace('/', '').replace('\\', '')
		save_path = os.path.join(IMAGES_DIR, filename)
		# avoid overwrite
		base, ext = os.path.splitext(filename)
		i = 1
		while os.path.exists(save_path):
			filename = f"{base}-{i}{ext}"
			save_path = os.path.join(IMAGES_DIR, filename)
			i += 1
		# ensure directory exists
		os.makedirs(IMAGES_DIR, exist_ok=True)
		f.save(save_path)
		prop_id = request.form.get('property_id')
		if prop_id:
			try:
				pid = int(prop_id)
				query_db('INSERT INTO images (property_id, filename) VALUES (?,?)', (pid, filename), commit=True)
			except Exception:
				app.logger.exception('Failed to associate image with property')
		url = url_for('serve_static', path=f'nestr images/{filename}')
		return jsonify({'filename': filename, 'url': url})
	except Exception as e:
		app.logger.exception('Upload failed')
		return jsonify({'error': 'Upload failed', 'message': str(e)}), 500


@app.route('/api/uploads/clear_my_uploads', methods=['POST'])
def api_clear_my_uploads():
	"""Delete image files and DB rows for properties owned by the authenticated user.
	This is authenticated and only affects images tied to properties where
	properties.landlord_id == current_user.id.
	Returns a JSON report of removed rows.
	"""
	user = authenticate_request(request)
	if not user:
		return jsonify({'error': 'Unauthorized'}), 401
	try:
		# find images for properties owned by this user
		rows = query_db('SELECT images.id AS id, images.filename AS filename FROM images JOIN properties ON images.property_id = properties.id WHERE properties.landlord_id = ?', (user['id'],))
		removed = []
		for r in rows:
			img_id = r['id']
			filename = r['filename']
			file_path = os.path.join(IMAGES_DIR, filename) if filename else None
			file_existed = False
			try:
				if file_path and os.path.exists(file_path):
					os.remove(file_path)
					file_existed = True
			except Exception:
				app.logger.exception('Failed to remove image file: %s', file_path)
			try:
				query_db('DELETE FROM images WHERE id = ?', (img_id,), commit=True)
			except Exception:
				app.logger.exception('Failed to delete DB row for image id %s', img_id)
			removed.append({'id': img_id, 'filename': filename, 'file_existed': file_existed})
		return jsonify({'removed': removed, 'count': len(removed)})
	except Exception as e:
		app.logger.exception('Failed to clear uploads for user %s', user.get('id'))
		return jsonify({'error': 'Failed to clear uploads', 'message': str(e)}), 500


if __name__ == '__main__':
	init_db()
	app.run(host='0.0.0.0', port=5000, debug=True)
