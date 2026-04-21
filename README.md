# Mood to Meme — CNN-Powered Live Meme Generator

Real-time facial emotion detection via webcam. A CNN classifies your mood from live video and serves you a matching meme.

## Stack

- **Model:** CNN (TensorFlow/Keras)
- **Dataset:** FER-2013 (facial expression recognition, 7 classes)
- **Video capture:** OpenCV
- **Notebook:** Jupyter (`mood-to-meme.ipynb`)

## How It Works

1. Webcam feed captured frame-by-frame via OpenCV
2. Face detected and cropped using Haar Cascade
3. Frame passed to CNN → emotion predicted (happy, sad, angry, surprised, neutral, etc.)
4. Meme fetched/selected from a local pool or API matching that emotion class
5. Meme displayed in real time alongside the video feed

## Usage

```bash
pip install tensorflow opencv-python numpy pandas matplotlib
jupyter notebook mood-to-meme.ipynb
```

Make sure your webcam is accessible and run all cells. Press `q` to quit the live feed.

## Project Structure

```
.
├── mood-to-meme.ipynb    # Model training + live inference
├── data/
│   └── labels.csv        # Emotion labels
└── mood-to-meme/         # Meme assets or fetching logic
```

## Requirements

- Python 3.10+
- Webcam
- PyTorch
