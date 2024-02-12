import { useRef, useEffect } from "preact/hooks"
import { Player } from '../index'


export class Key {
  position: number;
  sharp: boolean;

  dimensions: {
    w: number,
    h: number,

    x: number,
    y: number
  };

  clicks: {
    color: string,
    time: number;
  }[] = [];

  type: string;

  piano: {
    ctx: any, canvas: HTMLCanvasElement, keys: Key[]
  }

  constructor(position: number, sharp: boolean, type: string, piano: {
    ctx: any, keys: Key[], canvas: HTMLCanvasElement
  }) {
    this.type = type;
    this.position = position;
    this.sharp = sharp;
    this.piano = piano;
    this.dimensions = this.calculate();
  }

  isIn(x, y) {
    let x1 = this.dimensions.x;
    let y1 = this.dimensions.y;

    let x2 = this.dimensions.x + this.dimensions.w;
    let y2 = this.dimensions.y + this.dimensions.h;
    return (x > x1 && x < x2) && (y > y1 && y < y2);
  }

  click(color = "black") {
    this.clicks.push({
      color,
      time: Date.now()
    });
  }

  calculate(): {
    w: number,
    h: number,

    x: number,
    y: number
  } {
    let width = this.piano.canvas.width / 54; // with of a single white key
    let gap = 2; // gap setting, change to increase gap between keys

    let hOffset = 10; // height offset

    return {
      w: width - gap,
      h: (this.sharp ? this.piano.canvas.height / 2 : this.piano.canvas.height) - hOffset,
      x: this.position * width + (this.sharp ? width / 2 : 0),
      y: hOffset - 1,
    }
  }
}
const draw = (ctx, canvas, keys) => {
  // Renderer (boxRect) v2.1
  let timeBlipEnd = Date.now() - 1000;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  keys.forEach(z => {
    {
      ctx.save();
      let width = (canvas.width / 54) - 5;
      let height = z.dimensions.h / 15;
      let alpha = ctx.globalAlpha;
      for (let i = 0; i < z.clicks.length; i++) {
        let h = z.clicks[i];
        if (h.time > timeBlipEnd) {
          let g = [z.dimensions.x, z.dimensions.y + z.dimensions.h - (height * i) - height, width, height];

          if (g[1] < 0) continue;

          ctx.fillStyle = h.color.startsWith("#") ? h.color : "#" + h.color;
          ctx.globalAlpha = alpha - ((Date.now() - h.time) / 1000) * alpha;
          ctx.fillRect(...g);
        } else {
          z.clicks.splice(i, 1);
          --i;
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    ctx.globalCompositeOperation = "destination-over";

    ctx.fillStyle = z.sharp ? "black" : "white";


    ctx.fillRect(
      z.dimensions.x, z.dimensions.y,
      z.dimensions.w, z.dimensions.h,
    );
  })

  window.requestAnimationFrame(() => draw(ctx, canvas, keys));
}

const Piano = ({ keysRef, meRef, sendJsonMessage }: {
  keysRef: { current: Key[] },
  meRef: { current: Player },
  sendJsonMessage: any
}) => {
  const canvasRef = useRef(null)
  let notes = [];
  let shouldBePlayed = Date.now();

  let resizeWindow = () => {
    canvasRef.current.width = canvasRef.current.clientWidth;
    canvasRef.current.height = canvasRef.current.clientHeight;
    renderKeys(canvasRef.current.getContext("2d"));
    draw(canvasRef.current.getContext("2d"), canvasRef.current, keysRef.current)
  };

  let clickCanvas = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let matches = keysRef.current
      .filter(z => z.isIn(x, y))
      .sort((a, b) => Number(b.sharp) - Number(a.sharp));
    if (!matches[0]) return;
    let note: { v?: number, s?: number, n: string, d?: number } = {
      "n": matches[0].type,
    };

    if (e.type.endsWith("down")) {
      let v = y / matches[0].dimensions.h;
      note.v = v > 1 ? 1 : v;
    } else {
      note.s = 1;
    }
    shouldBePlayed = Date.now();
    notes.push(note)
    if (!note.s) {
      matches[0].click(meRef.current?.color);
    }
  }

  let keyMap = { A0: "a-1", Bb0: "as-1", B0: "b-1", C1: "c0", Db1: "cs0", D1: "d0", Eb1: "ds0", E1: "e0", F1: "f0", Gb1: "fs0", G1: "g0", Ab1: "gs0", A1: "a0", Bb1: "as0", B1: "b0", C2: "c1", Db2: "cs1", D2: "d1", Eb2: "ds1", E2: "e1", F2: "f1", Gb2: "fs1", G2: "g1", Ab2: "gs1", A2: "a1", Bb2: "as1", B2: "b1", C3: "c2", Db3: "cs2", D3: "d2", Eb3: "ds2", E3: "e2", F3: "f2", Gb3: "fs2", G3: "g2", Ab3: "gs2", A3: "a2", Bb3: "as2", B3: "b2", C4: "c3", Db4: "cs3", D4: "d3", Eb4: "ds3", E4: "e3", F4: "f3", Gb4: "fs3", G4: "g3", Ab4: "gs3", A4: "a3", Bb4: "as3", B4: "b3", C5: "c4", Db5: "cs4", D5: "d4", Eb5: "ds4", E5: "e4", F5: "f4", Gb5: "fs4", G5: "g4", Ab5: "gs4", A5: "a4", Bb5: "as4", B5: "b4", C6: "c5", Db6: "cs5", D6: "d5", Eb6: "ds5", E6: "e5", F6: "f5", Gb6: "fs5", G6: "g5", Ab6: "gs5", A6: "a5", Bb6: "as5", B6: "b5", C7: "c6", Db7: "cs6", D7: "d6", Eb7: "ds6", E7: "e6", F7: "f6", Gb7: "fs6", G7: "g6", Ab7: "gs6", A7: "a6", Bb7: "as6", B7: "b6", C8: "c7" };

  const renderKeys = ctx => {
    if (keysRef.current.length != 0) {
      keysRef.current.forEach(z => {
        z.dimensions = z.calculate();
      })
      return;
    }

    keysRef.current = [];
    let currentWhiteKey = 0;

    for (let z of Object.values(keyMap)) {
      if (z.includes("s")) {
        keysRef.current.push(new Key(currentWhiteKey, true, z, { ctx, canvas: canvasRef.current, keys: keysRef.current }));
      } else {
        currentWhiteKey++;
        keysRef.current.push(new Key(currentWhiteKey, false, z, { ctx, canvas: canvasRef.current, keys: keysRef.current }));
      }
    }

    keysRef.current = keysRef.current.sort((a, b) => Number(b.sharp) - Number(a.sharp))
  }

  useEffect(() => {
    window.addEventListener("resize", resizeWindow);

    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  useEffect(() => {
    canvasRef.current.addEventListener("mousedown", clickCanvas);
    canvasRef.current.addEventListener("mouseup", clickCanvas);

    return () => {
      canvasRef.current.removeEventListener("mousedown", clickCanvas);
      canvasRef.current.removeEventListener("mouseup", clickCanvas);
    }
  }, [])

  useEffect(() => {
    setInterval(() => {
      if (notes.length != 0) {
        sendJsonMessage([{
          "m": "n",
          "t": shouldBePlayed,
          n: notes
        }])
        notes = [];
      }
    }, 200)
  }, [])
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    resizeWindow();
    draw(canvasRef.current.getContext("2d"), canvasRef.current, keysRef.current);
  }, [draw])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

export default Piano