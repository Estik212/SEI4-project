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

