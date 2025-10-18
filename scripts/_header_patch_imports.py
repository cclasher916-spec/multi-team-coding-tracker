import os
import re
import time
import smtplib
import requests
from random import uniform
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import firebase_admin
from firebase_admin import credentials, firestore

import google.generativeai as genai
from scripts.read_google_sheet import read_google_sheet
from scripts._sync_members_patch import sync_members_from_sheet  # ensure defined before use

# Rest of file unchanged; this import guarantees sync_members_from_sheet exists
# ... (file content continues below in original) ...
