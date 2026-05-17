import os
import ast
import pandas as pd
from pymongo import MongoClient
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ['MONGO_URI']
DB_NAME = 'spotify'
CSV_PATH = './dataset.csv'
BATCH_SIZE = 1000

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

db['tracks_raw'].drop()

df = pd.read_csv(CSV_PATH)
print(f'Заватажено {len(df)} треків...')

df['explicit'] = df['explicit'].astype(bool)
