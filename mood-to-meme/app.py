from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import torch.nn.functional as F 
import cv2 as cv
import numpy as np
import base64
from PIL import Image
from io import BytesIO
from torchvision import transforms

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Model(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.conv3 = nn.Conv2d(64, 128, 3)
        self.conv4 = nn.Conv2d(128, 256, 3)
        self.batch_norm1 = nn.BatchNorm2d(32)
        self.batch_norm2 = nn.BatchNorm2d(64)
        self.batch_norm3 = nn.BatchNorm2d(128)
        self.batch_norm4 = nn.BatchNorm2d(256)
        self.pool = nn.MaxPool2d(2, 2)
        self.drop = nn.Dropout2d(p=0.3)
        self.fc1 = nn.Linear(256 * 6 * 6, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 8)

    def forward(self, xb):
        x = self.batch_norm1(self.conv1(xb))
        x = self.drop(self.pool(F.relu(x)))
        x = self.batch_norm2(self.conv2(x))
        x = self.drop(self.pool(F.relu(x)))
        x = self.batch_norm3(self.conv3(x))
        x = self.drop(self.pool(F.relu(x)))
        x = self.batch_norm4(self.conv4(x))
        x = self.drop(self.pool(F.relu(x)))
        x = torch.flatten(x, 1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x

model = Model()
model.load_state_dict(torch.load('model_weights.pt', map_location=torch.device('cpu'), weights_only=False))

moods = {1: "Contempt", 6: "sad", 4: "happy", 3: "fear", 2: "disgust", 5: "neutral", 0: "Anger", 7: "surprise"}

def preprocess(image):
    img_np = image.permute(1, 2, 0).numpy()
    img_gray = cv.cvtColor((img_np*255).astype(np.uint8), cv.COLOR_RGB2GRAY)
    img_resized = cv.resize(img_gray, (128, 128))
    new_img = cv.Canny(img_resized, 50, 150)
    new_img = new_img.astype("float32") / 255.0
    tensor = torch.tensor(new_img, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
    return tensor

@app.post('/predict')
async def predict(data: dict):

    raw = data['image']
    if ',' in raw:
        image = raw.split(',')[1]
    
    image_bytes = base64.b64decode(image)
    image = Image.open(BytesIO(image_bytes))
    transform = transforms.ToTensor()
    image_to_send = transform(image)

    processed = preprocess(image_to_send)
    with torch.no_grad():
        output = model(processed)
        label = torch.argmax(output).item()

    mood = moods[label]
    return {"mood" : mood}