# SEI4 Project — VES Renderer

A web-based vector graphics renderer built with **Flask** and **Pillow**.  
Write simple VES (Vector Editor Script) code and instantly see the rendered image in your browser.

---

## 🚀 Quick Start

### Windows

```bat
.\install.bat
```

### Linux / macOS

```bash
bash install.sh
```

The script will automatically:
1. Create a Python virtual environment (`activate/`)
2. Install all required dependencies from `requirements.txt`
3. Start the Flask development server

Then open your browser at **http://127.0.0.1:5000**

---

## 📋 Requirements

- Python 3.8+
- Dependencies listed in `requirements.txt` (installed automatically by the setup scripts):

| Package | Version |
|---------|---------|
| Flask | 3.1.3 |
| Pillow | 12.2.0 |
| Werkzeug | 3.1.8 |
| Jinja2 | 3.1.6 |

---

## 📁 Project Structure

```
SEI4-project/
├── main.py           # Flask web server & API routes
├── ves.py            # VES language parser and renderer
├── index.html        # Frontend UI
├── style.css         # Styles
├── app.js            # Frontend JavaScript logic
├── requirements.txt  # Python dependencies
├── install.bat       # Windows setup & launch script
└── install.sh        # Linux/macOS setup & launch script
```

---

## 🎨 VES Language Reference

VES (Vector Editor Script) is a simple scripting language for drawing 2D graphics.

### File Header (required)

Every VES script must start with a header line:

```
VES 1 <width> <height>
```

| Parameter | Description |
|-----------|-------------|
| `width` | Canvas width in pixels |
| `height` | Canvas height in pixels |

**Example:**
```
VES 1 400 200
```

---

### Commands

#### `CLEAR <color>`
Fills the entire canvas with a color.
```
CLEAR #FF0000
```

---

#### `LINE x1 y1 x2 y2 thickness color`
Draws a line from point A to point B.
```
LINE 10 10 200 100 2 #000000
```

---

#### `RECT x y width height thickness color`
Draws an unfilled rectangle.
```
RECT 10 10 150 80 2 #0000FF
```

---

#### `FILL_RECT x y width height color`
Draws a filled rectangle.
```
FILL_RECT 10 10 150 80 #00FF00
```

---

#### `CIRCLE x y radius thickness color`
Draws an unfilled circle.
```
CIRCLE 100 100 50 2 #FF00FF
```

---

#### `FILL_CIRCLE x y radius color`
Draws a filled circle.
```
FILL_CIRCLE 100 100 50 #FF00FF
```

---

#### `TRIANGLE x1 y1 x2 y2 x3 y3 thickness color`
Draws an unfilled triangle.
```
TRIANGLE 50 10 100 90 10 90 2 #FF8800
```

---

#### `FILL_TRIANGLE x1 y1 x2 y2 x3 y3 color`
Draws a filled triangle.
```
FILL_TRIANGLE 50 10 100 90 10 90 #FF8800
```

---

#### `# comment`
Lines starting with `#` are ignored (comments).
```
# This is a comment
```

---

### Full Example

```
VES 1 400 200
CLEAR #FFFFFF
FILL_RECT 10 10 380 180 #E0F0FF
CIRCLE 200 100 80 3 #0055CC
FILL_TRIANGLE 200 30 270 150 130 150 #FF6600
LINE 0 0 400 200 2 #000000
```

---

## 🌐 API

### `POST /render`

Renders a VES script and returns a PNG image.

**Form parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `ves` | string | VES source code |
| `width` | number | Target output width in pixels |

**Response:** PNG image (`image/png`)

---

## 📄 License

See [LICENSE](LICENSE) for details.