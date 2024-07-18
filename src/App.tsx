import { useState, useEffect, useRef } from 'react';
import './App.css';

import { gsap } from 'gsap';
// @ts-ignore
import { InertiaPlugin } from './esm/InertiaPlugin';
import { Draggable, MotionPathPlugin } from 'gsap/all';

// Ensure GSAP plugins are registered
gsap.registerPlugin(Draggable, InertiaPlugin, MotionPathPlugin);

function removeSingleQuotes(str: any) {
  return str.replace(/^'|'$/g, '');
}

const DialComponent = (props: any) => {
  const [dial, setDial] = useState<any>([]);
  const boxesContainerRef = useRef(null);
  const draggableRef: any = useRef();

  useEffect(() => {
    if (props.slots) {
      console.log(props.slots);
      const arr = Array.from(props.slots).reverse();
      let lastElement = arr.pop(); // Removes the last element and returns it
      arr.unshift(lastElement);

      if (props.dialID == 1) setDial(arr.map((el) => removeSingleQuotes(el)));
      else setDial(arr);
      props.setDescription(String(removeSingleQuotes(arr[0])));
    }
  }, []);

  useEffect(() => {
    if (!boxesContainerRef.current) return;

    // Animate boxes when dial updates
    const boxes = gsap.utils.toArray(`.box-${props.dialName}`);

    gsap.set(boxes, {
      //@ts-ignore
      motionPath: {
        path: `#${props.dialName}`,
        align: `#${props.dialName}`,
        alignOrigin: [0.5, 0.5],
        start: -0.25,
        end: (i: any) => i / boxes.length - 0.25,
        autoRotate: true
      }
    });

    // Set up draggable rotation with snapping
    draggableRef.current = Draggable.create(`.container-${props.dialName}`, {
      type: "rotation",
      inertia: true,
      snap: (endVal) => handleSnap(endVal, boxes.length)
    });
  }, [dial]);

  const handleSnap = (endVal: any, boxCount: any) => {
    const numberOfBoxes = Math.max(boxCount, 1);
    const snappedValue = gsap.utils.snap(360 / numberOfBoxes, endVal);
    let index = Math.round(snappedValue / (360 / numberOfBoxes));
    index = ((index % dial.length) + dial.length) % dial.length;

    if (props.dialID == 1) {
      props.setDescription(removeSingleQuotes(props.slots[String((index))]));
    } else {
      props.setDescription(props.slots[String((index))]);
    }

    return snappedValue;
  };

  useEffect(() => {}, [props.updateZIndex]);

  return (
    <div className="wrapper" style={{ zIndex: props.updateZIndex ? '-1' : '1' }}>
      <div className={`container container-${props.dialName}`}>
        <svg viewBox="0 0 400 400">
          <path
            stroke-width="2"
            stroke="transparent"
            id={props.dialName}
            fill="none"
            d="M396,200 C396,308.24781 308.24781,396 200,396 91.75219,396 4,308.24781 4,200 4,91.75219 91.75219,4 200,4 308.24781,4 396,91.75219 396,200 z"
          ></path>
        </svg>
        <div ref={boxesContainerRef} className={`boxes-container boxes-container${props.dialName}`}>
          {dial.map((element: any, index: any) => (
            <div key={index} className={`box box-${props.dialName}`}>{element}</div>
          ))}
        </div>
      </div>
      <div id="description">{props.description}</div>
    </div>
  );
};

function App() {
  const strings = [
    "nor", "bot", "wic", "soc", "wat", "dol", "mag", "pic", "dav", "bid", "bal", "tim", "tas", "mal", "lig", "siv",
    "tag", "pad", "sal", "div", "dac", "tan", "sid", "fab", "tar", "mon", "ran", "nis", "wol", "mis", "pal", "las",
    "dis", "map", "rab", "tob", "rol", "lat", "lon", "nod", "nav", "fig", "nom", "nib", "pag", "sop", "ral", "bil",
    "had", "doc", "rid", "moc", "pac", "rav", "rip", "fal", "tod", "til", "tin", "hap", "mic", "fan", "pat", "tac",
    "lab", "mog", "sim", "son", "pin", "lom", "ric", "tap", "fir", "has", "bos", "bat", "poc", "hac", "tid", "hav",
    "sap", "lin", "dib", "hos", "dab", "bit", "bar", "rac", "par", "lod", "dos", "bor", "toc", "hil", "mac", "tom",
    "dig", "fil", "fas", "mit", "hob", "har", "mig", "hin", "rad", "mas", "hal", "rag", "lag", "fad", "top", "mop",
    "hab", "nil", "nos", "mil", "fop", "fam", "dat", "nol", "din", "hat", "nac", "ris", "fot", "rib", "hoc", "nim",
    "lar", "fit", "wal", "rap", "sar", "nal", "mos", "lan", "don", "dan", "lad", "dov", "riv", "bac", "pol", "lap",
    "tal", "pit", "nam", "bon", "ros", "ton", "fod", "pon", "sov", "noc", "sor", "lav", "mat", "mip", "fip"
  ];

  const result: any = [];
  for (let i = 0; i < strings.length; i += 16) {
    if (i + 16 <= strings.length) {
      result.push(strings.slice(i, i + 16));
    } else {
      result.push(strings.slice(i));
    }
  }

  const [updateZIndex, _] = useState(false);
  const [key, setKey] = useState(0);

  const [description, setDescription] = useState('');
  const [dial, setDial] = useState(result[0]);
  const latestAlpha = useRef(0);
  const latestCoords = useRef({ latitude: 0, longitude: 0 });

  useEffect(() => {
    const handleOrientation = (event: any) => {
      latestAlpha.current = event.alpha; // Update the ref with the latest alpha value
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        latestCoords.current = { latitude, longitude };
        console.log("Latitude: ", latitude);
        console.log("Longitude: ", longitude);
      });
    } else {
      console.log("Geolocation is not available");
    }
  }, []);

  useEffect(() => {
    const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
      const toRadians = (deg: number) => deg * (Math.PI / 180);
      const toDegrees = (rad: number) => rad * (180 / Math.PI);

      const dLon = toRadians(endLng - startLng);
      const y = Math.sin(dLon) * Math.cos(toRadians(endLat));
      const x = Math.cos(toRadians(startLat)) * Math.sin(toRadians(endLat)) - 
                Math.sin(toRadians(startLat)) * Math.cos(toRadians(endLat)) * Math.cos(dLon);

      return (toDegrees(Math.atan2(y, x)) + 360) % 360;
    };

    const updateCompass = () => {
      const alpha = latestAlpha.current;
      const { latitude, longitude } = latestCoords.current;

      const northDirection = calculateBearing(latitude, longitude, latitude + 0.1, longitude);
      const direction = Math.round((alpha + northDirection) / 360 * dial.length) % dial.length;

      setDescription(dial[direction]);

      // Rotate the dial to point the first element to the calculated direction
      const rotatedDial = [...dial.slice(direction), ...dial.slice(0, direction)];
      setDial(rotatedDial);
      console.log(rotatedDial);
      console.log("Updated Direction: ", dial[direction]);
      setKey(prevKey => prevKey + 1);
    };

    const interval = setInterval(updateCompass, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [dial]);

  return (
    <>
      <DialComponent key={key} updateZIndex={updateZIndex} description={description} setDescription={setDescription} dialID={1} slots={dial} dialName={"path-1"} />
    </>
  );
}

export default App;
