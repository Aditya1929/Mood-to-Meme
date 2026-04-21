import { useEffect, useRef, useState } from 'react' // these are the react hooks
import './App.css'
import './index.css'



function App(){
  const webCamVideo = useRef<HTMLVideoElement>(null); // this creates a variable that says use this webcamvideo as a reference to my video element
  const [meme, setMeme] = useState<string>(""); // this is to store and update value in my data. so meme can take in string or null. when we change it using setMeme, this updates the meme.
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mood, setMood] = useState("happy");
  const [count, setCount] = useState({mood: '', count: 0});
  const moodMap: { [key: string]: string } = {
    "happy": "happy people",
    "sad": "sad people"
  }


  useEffect(() => { // useEffect is used to create some side effects. in this case loading the camera, but in most cases fetching data, interacting with the document somehow, etc. 
    const getWebCam = async () => { // this is to create an async function because it awaits the get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {width: 720, height: 480}
        });

        if (webCamVideo.current){ // this checks if the video element exists and if it does assigns the incoming video stream to that reference object
          webCamVideo.current.srcObject = stream;
        }


      } catch (error){
      console.log(error);
    }
    }
    getWebCam();

    const intervaldId = setInterval(async () => { // this is the code to essentially take a canvas element as defined by the user using useRef,
      if (canvas.current && webCamVideo.current){ // capture a video frame by drawing it and storing that in a specific url which can then be logged.
        const context = canvas.current.getContext('2d');
        context?.drawImage(webCamVideo.current, 0, 0, 720, 480);
        const imageData = canvas.current.toDataURL('image/jpeg');

        try {
          const response = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify({
              image: imageData
            })
          });
        
        const data = await response.json();
        setMood(data.mood);
        setCount({mood: data.mood, count: count.count + 1})

        } catch (error){
        console.log(error);
      }
      }
      
    }, 5000);

    return () => { // this is a cleanup function that is called when the application closes
      if (webCamVideo.current?.srcObject){ // its basically asking if the current video object exists and if it does then for each stream track, unplug it. 
        const stream = webCamVideo.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(intervaldId); // this needs to be done during cleanup such as when the app closes. 
      
    }

  }, []);

  useEffect(() => {
    const fetchMeme = async (currentMood: string) => {
      const randomOffset = Math.floor(Math.random() * 100)
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=pqq9z5ygLK3wT7rHgzpYEy6DCfGknF8I&q=${moodMap[currentMood]}&offset=${randomOffset}&offset=${randomOffset}&limit=25`);
      const data = await response.json()
      const randomIndex = Math.floor(Math.random() * data.data.length)
      setMeme(data.data[randomIndex].images.original.url);
    }
    fetchMeme(mood);
  }, [mood])

  return (
    <div>
      <title>Dank Memer</title>
      <h1 className='fixed top-10 left-0 right-0'>emotion-aware content recommendation</h1>
      <video ref={webCamVideo} autoPlay className='absolute top-40 left-30 rounded-2xl shadow-2xl scale-x-[-1]'></video> 
      <canvas ref={canvas} width={720} height={480} className='hidden'></canvas>
      

      
      {/* Meme placeholder on the right - SAME classes! */}
      <div className="absolute top-40 right-30 w-[720px] h-[480px] rounded-2xl shadow-2xl bg-gray-200"> 
        {meme ? (
          <img src={meme} alt="meme" className="w-[720px] h-[480px] object-fit rounded-3xl" />
        ) : (
          <p className="text-gray-500">meme will appear here</p> // this is saying if the meme exists, then display the image, else display the text on the same div. check comment below. 
        )}
      </div>

    </div>

    
    
  )
  

}

export default App


/**
This is called a ternary operator: 

 * {meme ? (
  // Show this if meme exists
) : (
  // Show this if meme doesn't exist
)}

 */