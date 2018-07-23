#python
# -*- coding: utf-8 -*-
from __future__ import division
from io import BytesIO
import re
import operator
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import TextConverter, HTMLConverter
from pdfminer.layout import LAParams
from pdfminer.pdfpage import PDFPage

from elasticsearch import Elasticsearch
es = Elasticsearch()

INDEX = 'oregonwater'
DOCTYPE = 'page'
pdfFilePath = 'Water_Vol_I.pdf'

def convert(page, html=None):

    manager = PDFResourceManager()
    codec = 'utf-8'
    output = BytesIO()
    if(not html):
        converter = TextConverter(manager, output, codec=codec, laparams=LAParams())
        interpreter = PDFPageInterpreter(manager, converter)
    else:
        converter = HTMLConverter(manager, output, codec=codec, showpageno=False, laparams=LAParams())
        interpreter = PDFPageInterpreter(manager, converter)

    interpreter.process_page(page)
    pagetext = output.getvalue()
    converter.close()
    output.close
    return pagetext

pagePatterns = [b'(?:Page\s([0-9]+))',b'(?:\n{2,}([0-9IVXivx]+)\s*$)']
pp = re.compile('|'.join(pagePatterns))
def getPageNumber(text):
    try:
        pagenumber = pp.findall(text)
        pagenumber = reduce(None,filter(None,pagenumber[0]))
    except:
        pagenumber = '-1'
    return pagenumber

def savePage(pageindex, pagenumber, text, html):
    es.index(index=INDEX, doc_type=DOCTYPE, body={"pageindex":pageindex, "pagenumber":pagenumber, "text":text, 'html':html, 'keywords':[]})

def convertPages(fname=pdfFilePath, pages = None):
    if not pages:
        pagenums = set()
    else:
        pagenums = set(pages)
    infile = file(fname, 'rb')
    print(fname)
    text = ''
    for pageindex, page in enumerate(PDFPage.get_pages(infile, pages)):
        text = convert(page)
        html = convert(page,'html')
        pagenumber = getPageNumber(text)
        savePage(pageindex, pagenumber, text, html)
        if(pagenumber == '-1'):
            print(text)

        print(pagenumber)
    infile.close()

#Split pdf into one page pdfs
from pyPdf import PdfFileWriter, PdfFileReader

def makeOnePagersOld(filename=pdfFilePath ,path='pdf/'):
    infile = PdfFileReader(open(filename, 'rb'))
    print(infile.getNumPages())
    for i in range(infile.getNumPages()):
        p = infile.getPage(i)
        outfile = PdfFileWriter()
        outfile.addPage(p)
        outputStream = file(path+'pageindex-%02d.pdf' % i, 'wb')
        outfile.write(outputStream)
        outputStream.close()

def makeOnePagersOld2(filename=pdfFilePath ,path='pdf/'):
    infile = file(filename, 'rb')
    for i, page in enumerate(PDFPage.get_pages(infile)):
        with open(path+'pageindex-%0s.pdf' % str(i), 'wb') as f:
            print(i)
            f.write(page.contents[0])

#Split pdf into one page pdfs
from pdfrw import PdfWriter, PdfReader

def makeOnePagers(filename=pdfFilePath ,path='pdf/'):
    infile = PdfReader(filename)
    pages = len(infile.pages)
    print(pages)
    for i in range(pages):
       p = infile.pages[i]
       if(p and len(p)>0):
           outfile = PdfWriter()
           outfile.addPage(p)
           try:
               outfile.write('pdf/pageindex-%s.pdf' % str(i))
           except:
               pass
           print(i)
