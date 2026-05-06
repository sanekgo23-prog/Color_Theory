import os
import json
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from models import db, User, Palette
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-me'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2 MB
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# ------------------ Маршруты ------------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        avatar = request.files.get('avatar')

        if not username or not email or not password:
            flash('Заполните все поля', 'danger')
            return redirect(url_for('register'))

        if User.query.filter_by(username=username).first():
            flash('Имя пользователя уже занято', 'danger')
            return redirect(url_for('register'))
        if User.query.filter_by(email=email).first():
            flash('Email уже используется', 'danger')
            return redirect(url_for('register'))

        user = User(username=username, email=email)
        user.set_password(password)

        if avatar and allowed_file(avatar.filename):
            filename = secure_filename(f"{username}_{datetime.utcnow().timestamp()}.{avatar.filename.rsplit('.',1)[1]}")
            avatar.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            user.avatar = filename

        db.session.add(user)
        db.session.commit()
        flash('Регистрация прошла успешно! Теперь войдите.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            flash('Добро пожаловать!', 'success')
            return redirect(url_for('index'))
        flash('Неверный email или пароль', 'danger')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/profile')
@login_required
def profile():
    user_palettes = Palette.query.filter_by(user_id=current_user.id).order_by(Palette.created_at.desc()).all()
    return render_template('profile.html', palettes=user_palettes)

@app.route('/save_palette', methods=['POST'])
@login_required
def save_palette():
    data = request.get_json()
    if not data or 'colors' not in data:
        return jsonify({'error': 'Нет данных'}), 400
    colors = data['colors']
    mode = data.get('mode', '')
    name = data.get('name', 'Без названия')
    is_public = data.get('is_public', True)

    palette = Palette(
        name=name,
        colors_json=json.dumps(colors),
        mode=mode,
        is_public=is_public,
        user_id=current_user.id
    )
    db.session.add(palette)
    db.session.commit()
    return jsonify({'message': 'Палитра сохранена!', 'palette_id': palette.id})

@app.route('/palette/<int:id>')
def palette_detail(id):
    palette = Palette.query.get_or_404(id)
    return render_template('palette_detail.html', palette=palette)

@app.route('/shared')
def shared_palettes():
    public_palettes = Palette.query.filter_by(is_public=True).order_by(Palette.created_at.desc()).all()
    return render_template('shared_palettes.html', palettes=public_palettes)

@app.route('/delete_palette/<int:id>', methods=['POST'])
@login_required
def delete_palette(id):
    palette = Palette.query.get_or_404(id)
    if palette.user_id != current_user.id:
        return redirect(url_for('profile'))
    db.session.delete(palette)
    db.session.commit()
    flash('Палитра удалена', 'success')
    return redirect(url_for('profile'))

# ------------------ REST API ------------------
@app.route('/api/palettes')
def api_get_public_palettes():
    palettes = Palette.query.filter_by(is_public=True).order_by(Palette.created_at.desc()).all()
    result = []
    for p in palettes:
        result.append({
            'id': p.id,
            'name': p.name,
            'colors': p.get_colors(),
            'mode': p.mode,
            'author': p.author.username,
            'created_at': p.created_at.strftime('%Y-%m-%d %H:%M')
        })
    return jsonify(result)

@app.route('/api/palette/<int:id>')
def api_get_palette(id):
    palette = Palette.query.get_or_404(id)
    if not palette.is_public and (not current_user.is_authenticated or current_user.id != palette.user_id):
        return jsonify({'error': 'Access denied'}), 403
    return jsonify({
        'id': palette.id,
        'name': palette.name,
        'colors': palette.get_colors(),
        'mode': palette.mode,
        'author': palette.author.username,
        'created_at': palette.created_at.strftime('%Y-%m-%d %H:%M')
    })

# ------------------ Статика (аватары) ------------------
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ------------------ Инициализация БД ------------------
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)