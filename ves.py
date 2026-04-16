from PIL import Image
from random import randint


def random_color():
  r = randint(0, 255)
  g = randint(0, 255)
  b = randint(0, 255)
  return (r, g, b)

def render_ves(ves_string, target_width):
    # Ak formulár nič neposlal, vrátime biely obrázok
    if not ves_string or ves_string.strip() == "":
        return Image.new('RGB', (640, 400), (255, 255, 255))
        
    # Namiesto load_file_content si text rozdelíme priamo na riadky a slová z reťazca
    pole = []
    lines = ves_string.strip().split('\n')
    for riadok in lines:
        if riadok.strip():
            pole.append([slovo for slovo in riadok.strip().split(" ") if slovo])
            
    # Ak chýba VES hlavička, vrátime červený varovný obrázok s upozornením
    if len(pole) == 0 or pole[0][0] != "VES":
        return Image.new('RGB', (640, 400), (255, 0, 0))
        
    # Získanie originálnych rozmerov
    width = int(pole[0][2])
    height = int(pole[0][3])
    
    # Výpočet nových rozmerov na základe target_width zo stránky
    if target_width:
        n_width = int(float(target_width))
    else:
        n_width = width
    
    n_height = int(height * (n_width / width)) if width != 0 else height

    img = Image.new("RGB", (n_width, n_height), "white")
    prazdny, neznamy = 0, 0

    for i in range(1, len(pole)):
        com = pole[i][0]
        if com == "CLEAR" and len(pole[i]) >= 2 :
            fill_rect(img, (0, 0), (n_width, n_height), hex2dec_color(pole[i][1].strip()))
        elif com == "LINE" and len(pole[i]) >= 7 :
            ax = int(int(pole[i][1]) * (n_width / width))
            ay = int(int(pole[i][2]) * (n_height / height))
            bx = int(int(pole[i][3]) * (n_width / width))
            by = int(int(pole[i][4]) * (n_height / height))
            thickness = int(pole[i][5])
            color = hex2dec_color(pole[i][6].strip())
            thick_line(img, (ax, ay), (bx, by), thickness, color)
        elif com == "RECT" and len(pole[i]) >= 7 :
            ax = int(int(pole[i][1]) * (n_width / width))
            ay = int(int(pole[i][2]) * (n_height / height))
            bx = int(int(pole[i][3]) * (n_width / width))
            by = int(int(pole[i][4]) * (n_height / height))
            thickness = int(pole[i][5])
            color = hex2dec_color(pole[i][6].strip())
            rect(img, (ax, ay), (bx, by), thickness, color)
        elif com == "TRIANGLE" and len(pole[i]) >= 9 :
            ax = int(int(pole[i][1]) * (n_width / width))
            ay = int(int(pole[i][2]) * (n_height / height))
            bx = int(int(pole[i][3]) * (n_width / width))
            by = int(int(pole[i][4]) * (n_height / height))
            cx = int(int(pole[i][5]) * (n_width / width))
            cy = int(int(pole[i][6]) * (n_height / height))
            thickness = int(pole[i][7])
            color = hex2dec_color(pole[i][8].strip())
            triangle(img, (ax, ay), (bx, by), (cx, cy), thickness, color)
        elif com == "CIRCLE" and len(pole[i]) >= 6 :
            ax = int(int(pole[i][1]) * (n_width / width))
            ay = int(int(pole[i][2]) * (n_height / height))
            r = int(int(pole[i][3]) * (n_width / width))
            thickness = int(pole[i][4])
            color = hex2dec_color(pole[i][5].strip())
            circle(img, (ax, ay), r, thickness, color)
        elif com == "FILL_CIRCLE" and len(pole[i]) >= 5 :
            ax = int(int(pole[i][1]) * (n_width / width))
            ay = int(int(pole[i][2]) * (n_height / height))
            r = int(int(pole[i][3]) * (n_width / width))
            color = hex2dec_color(pole[i][4].strip())
            fill_circle(img, (ax, ay), r, color)
        elif com == "FILL_TRIANGLE" and len(pole[i]) >= 8 :
            ax = int(int(pole[i][1]) * (n_width / width))
            ay = int(int(pole[i][2]) * (n_height / height))
            bx = int(int(pole[i][3]) * (n_width / width))
            by = int(int(pole[i][4]) * (n_height / height))
            cx = int(int(pole[i][5]) * (n_width / width))
            cy = int(int(pole[i][6]) * (n_height / height))
            color = hex2dec_color(pole[i][7].strip())
            fill_triangle(img, (ax, ay), (bx, by), (cx, cy), color)
        elif com == "FILL_RECT" and len(pole[i]) >= 6 :
            ax = int(int(pole[i][1]) * (n_width / width))
            ay = int(int(pole[i][2]) * (n_height / height))
            bx = int(int(pole[i][3]) * (n_width / width))
            by = int(int(pole[i][4]) * (n_height / height))
            color = hex2dec_color(pole[i][5].strip())
            fill_rect(img, (ax, ay), (bx, by), color)
        elif com == "#" or pole[i][0][0] == "#":
            continue
        else:
            neznamy += 1
            
    # NEVOLÁME display(img) - chceme obrázok vrátiť do webového servera
    return img

def dec2hex(cislo):
  '''Prevod cisla z dec do hex sustavy'''
  a = ""
  while cislo > 0:
    zvysok = cislo % 16

    if zvysok == 10:
      zvysok = "A"
    elif zvysok == 11:
      zvysok = "B"
    elif zvysok == 12:
      zvysok = "C"
    elif zvysok == 13:
      zvysok = "D"
    elif zvysok == 14:
      zvysok = "E"
    elif zvysok == 15:
      zvysok = "F"

    a += str(zvysok)
    cislo = cislo // 16
  return a[::-1]

def hex2dec(cislo):
  '''Prevod cisla z hex do dec sustavy'''
  cislo = cislo[::-1]
  sucet = 0
  exp = 0
  for i in cislo:
    if i == "A":
      sucet += 10 * 16**exp
    elif i == "B":
      sucet += 11 * 16**exp
    elif i == "C":
      sucet += 12 * 16**exp
    elif i == "D":
      sucet += 13 * 16**exp
    elif i == "E":
      sucet += 14 * 16**exp
    elif i == "F":
      sucet += 15 * 16**exp
    else:
      sucet += int(i) * 16**exp
    exp += 1
  return sucet

def dec2hex_color(color):
  '''(r, g, b) -> #F0F0F0'''
  red, green, blue = color
  r = dec2hex(red)
  if len(r) < 2:
    r = "0" + r
  g = dec2hex(green)
  if len(g) < 2:
    g = "0" + g
  b = dec2hex(blue)
  if len(b) < 2:
    b = "0" + b
  return f"#{r}{g}{b}"

def hex2dec_color(color):
  '''#A011FF -> (r, g, b)'''
  r = color[1:3]
  g = color[3:5]
  b = color[5:]
  return hex2dec(r), hex2dec(g), hex2dec(b)

def draw_line(img, A, B, color):
  '''Nakresli do obrazku ciaru'''
  dx = B[0] - A[0]
  dy = B[1] - A[1]
  width, height = img.size

  if dx == 0:
    if A[1] > B[1]:
      A, B = B, A
    for y in range(A[1], B[1]):
      x = A[0]
      if not (x < 0 or y < 0 or x >= width or y >= height):
        img.putpixel((A[0], y), color)

  elif dy == 0:
    for x in range(A[0], B[0]):
      y = 0*x + A[1]
      if not (x < 0 or y < 0 or x >= width or y >= height):
        img.putpixel((x, y), color)

  elif abs(dx) > abs(dy):
    if A[0] > B[0]:
      A, B = B, A
    for x in range(A[0], B[0] + 1):
      y = int((dy)/(dx) * (x - A[0]) + A[1])
      if not (x < 0 or y < 0 or x >= width or y >= height):
        img.putpixel((x, y), color)

  else:
    if A[1] > B[1]:
      A, B = B, A
    for y in range(A[1], B[1] + 1):
      x = int( (dx / dy) * (y - A[1]) + A[0])
      if not (x < 0 or y < 0 or x >= width or y >= height):
        img.putpixel((x, y), color)

def draw_pixel(img, X, farba):
  '''Nakresli do obrazku trojuholnik vyplneny'''
  width, height = img.size
  x, y = X
  if not (x < 0 or y < 0 or x >= width or y >= height):
    img.putpixel(X, farba)

def get_line_pixels(img, A, B):
  '''Vrati pole pixelov medzi dvoma bodmi'''
  pixels = []

  dx = B[0] - A[0]
  dy = B[1] - A[1]
  width, height = img.size

  if dx == 0:
    if A[1] > B[1]:
      A, B = B, A
    for y in range(A[1], B[1]):
      x = A[0]
      if not (x < 0 or y < 0 or x >= width or y >= height):
        pixels.append((A[0], y))

  elif dy == 0:
    for x in range(A[0], B[0]):
      y = 0*x + A[1]
      if not (x < 0 or y < 0 or x >= width or y >= height):
        pixels.append((x, y))

  elif abs(dx) > abs(dy):
    if A[0] > B[0]:
      A, B = B, A
    for x in range(A[0], B[0] + 1):
      y = int((dy)/(dx) * (x - A[0]) + A[1])
      if not (x < 0 or y < 0 or x >= width or y >= height):
        pixels.append((x, y))

  else:
    if A[1] > B[1]:
      A, B = B, A
    for y in range(A[1], B[1] + 1):
      x = int( (dx / dy) * (y - A[1]) + A[0])
      if not (x < 0 or y < 0 or x >= width or y >= height):
        pixels.append((x, y))
  return pixels

def thick_line(img, A, B, thickness, color):
  '''Nakresli do obrazku ciaru s nejakou hrubkou'''
  for pixel in get_line_pixels(img, A, B):
    fill_circle(img, pixel, thickness, color)

def rect(img, A, B, thickness, color):
  '''Nakresli do obrazku obdlznik nevyplneny'''
  ax, ay = A
  w, h = B
  bx, by = ax + w, ay + h

  if ax < bx and ay < by:
    thick_line(img, (ax, ay), (bx, ay), thickness, color)
    thick_line(img, (bx, ay), (bx, by), thickness, color)
    thick_line(img, (ax, ay), (ax, by), thickness, color)
    thick_line(img, (ax, by), (bx, by), thickness, color)
  elif ax < bx and ay > by:
    thick_line(img, (ax, ay), (bx, ay), thickness, color)
    thick_line(img, (bx, ay), (bx, by), thickness, color)
    thick_line(img, (ax, ay), (ax, by), thickness, color)
    thick_line(img, (ax, by), (bx, by), thickness, color)

  elif ax > bx and ay < by:
    ax, bx = bx, ax
    thick_line(img, (ax, ay), (bx, ay), thickness, color)
    thick_line(img, (bx, ay), (bx, by), thickness, color)
    thick_line(img, (ax, ay), (ax, by), thickness, color)
    thick_line(img, (ax, by), (bx, by), thickness, color)
  elif ax > bx and ay > by:
    ax, bx = bx, ax
    thick_line(img, (ax, ay), (bx, ay), thickness, color)
    thick_line(img, (bx, ay), (bx, by), thickness, color)
    thick_line(img, (ax, ay), (ax, by), thickness, color)
    thick_line(img, (ax, by), (bx, by), thickness, color)

def triangle(obrazok, A, B, C, thickness, color):
  '''Nakresli do obrazku trojuholnik nevyplneny'''
  thick_line(obrazok, A, B, thickness, color)
  thick_line(obrazok, B, C, thickness, color)
  thick_line(obrazok, A, C, thickness, color)

def circle(img, A, r, thickness, color):
  '''Nakresli do obrazku kruznicu'''
  S = A
  for x in range(0, int(r / (2**0.5)) + 1):
    y = int((r**2 - x**2)**0.5)
    fill_circle(img, (x + S[0], y + S[1]), thickness, color)
    fill_circle(img, (y + S[0], x + S[1]), thickness, color)
    fill_circle(img, (y + S[0], -x + S[1]), thickness, color)
    fill_circle(img, (x + S[0], -y + S[1]), thickness, color)
    fill_circle(img, (-x + S[0], -y + S[1]), thickness, color)
    fill_circle(img, (-y + S[0], -x + S[1]), thickness, color)
    fill_circle(img, (-y + S[0], x + S[1]), thickness, color)
    fill_circle(img, (-x + S[0], y + S[1]), thickness, color)

def fill_circle(img, S, r, color):
  '''Nakresli do obrazku kruh vyplneny'''
  for x in range(0, int(r / (2**0.5)) + 1):
    y = int((r**2 - x**2)**0.5)

    draw_line(img, (x + S[0], y + S[1]), (x + S[0], -y + S[1]), color)
    draw_line(img, (y + S[0], x + S[1]), (y + S[0], -x + S[1]), color)
    draw_line(img, (-x + S[0], -y + S[1]), (-x + S[0], y + S[1]), color)
    draw_line(img, (-y + S[0], -x + S[1]), (-y + S[0], x + S[1]), color)

def fill_triangle(img, A, B, C, color):
  '''Nakresli do obrazku trojuholnik vyplneny'''

  ymin = min(A[1], B[1], C[1])
  ymax = max(A[1], B[1], C[1])

  if ymin < 0:
    ymin = 0
  if ymax >= img.height:
    ymax = img.height - 1

  pixels = get_line_pixels(img, A, B) + get_line_pixels(img, B, C) + get_line_pixels(img, C, A)

  xmin = [img.width] * (ymax + 1)
  xmax = [-1] * (ymax + 1)

  for p in pixels:
    x, y = p

    if y > ymax or y < ymin:
      continue

    if x < xmin[y]:
      xmin[y] = x
    if x > xmax[y]:
      xmax[y] = x

  for y in range(ymin, ymax + 1):
    if xmin[y] <= xmax[y]:
      draw_line(img, (xmin[y], y), (xmax[y], y), color)

def fill_rect(img, A, B, color):
  '''Nakresli do obrazku obdlznik vyplneny'''
  ax, ay = A
  width, height = B
  bx, by = ax + width, ay + height

  if ax < bx and ay > by:
    ay, by = by, ay
    for x in range(ax, bx):
      for y in range(ay, by):
        img.putpixel((x, y), color)
  elif ax < bx and ay < by:
    for x in range(ax, bx):
      for y in range(ay, by):
        img.putpixel((x, y), color)

  elif ax > bx and ay > by:
    ax, bx = bx, ax
    ay, by = by, ay
    for x in range(ax, bx):
      for y in range(ay, by):
        img.putpixel((x, y), color)
  elif ax > bx and ay < by:
    ax, bx = bx, ax
    for x in range(ax, bx):
      for y in range(ay, by):
        img.putpixel((x, y), color)
