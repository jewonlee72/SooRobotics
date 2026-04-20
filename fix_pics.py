import fitz
import os

pdf_path = r"c:\Users\benzy\Documents\01_projects\001_Homepage\SooRobotics\PORTFOLIO.pdf"

try:
    doc = fitz.open(pdf_path)
    for p in range(len(doc)):
        images = doc.get_page_images(p)
        for index, img in enumerate(images):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.n - pix.alpha > 3:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            if pix.width > 200 and pix.height > 200:
                print(f"Page {p} Index {index} Xref {xref} -> {pix.width}x{pix.height}")
except Exception as e:
    print(f"Error: {e}")
