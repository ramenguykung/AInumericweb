import { useState } from "react";
import "./Bisection.css";
import { evaluate } from "mathjs";

export default function Bisection() {
  const [fx, setFx] = useState("x^4 - 13");
  const [xl, setXl] = useState("");
  const [xr, setXr] = useState("");
  const [tolerance, setTolerance] = useState("");
  const [result, setResult] = useState([]);
  const [saveStatus, setSaveStatus] = useState("");

  const calculateBisection = () => {
    // ตรวจสอบ input
    let xL = parseFloat(xl);
    let xR = parseFloat(xr);
    const tol = parseFloat(tolerance);

    if (isNaN(xL) || isNaN(xR) || isNaN(tol) || xl === "" || xr === "" || tolerance === "") {
      alert("กรุณากรอกค่า xL, xR, และ Tolerance ให้ครบและเป็นตัวเลข");
      return;
    }

    let xM = 0;
    let old_xM = 0;
    let error = 1;
    let iterations = 0;

    const logs = [];

    const f = (x) => evaluate(fx, { x });

    while (error > tol) {
      xM = (xL + xR) / 2.0;

      if (iterations > 0) {
        error = Math.abs((xM - old_xM) / xM);
      }

      logs.push({
        iteration: iterations,
        xL: xL.toFixed(6),
        xR: xR.toFixed(6),
        xM: xM.toFixed(6),
        error: error.toFixed(tolerance.length - 2) || "N/A",
      });
      if (f(xM) * f(xR) > 0) {
        xR = xM;
      } else {
        xL = xM;
      }

      old_xM = xM;
      iterations++;

      if (iterations > 1000) break;
    }

    setResult(logs);

    // ส่งข้อมูลไปบันทึกในฐานข้อมูล
    const finalResult = parseFloat(logs[logs.length - 1]?.xM) || parseFloat(xM);
    if (isNaN(finalResult)) {
      setSaveStatus("การคำนวณล้มเหลว ผลลัพธ์ไม่ถูกต้อง");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    console.log("Sending data:", { function_text: fx, lower_bound: xL, upper_bound: xR, result: finalResult }); // Log ข้อมูลที่ส่ง
    fetch(`${import.meta.env.VITE_API_URL}/bisection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function_text: fx,
        lower_bound: xL,
        upper_bound: xR,
        result: finalResult,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to save: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        setSaveStatus("บันทึกข้อมูลสำเร็จ!");
        setTimeout(() => setSaveStatus(""), 3000);
      })
      .catch(error => {
        console.error('Error:', error);
        setSaveStatus("บันทึกข้อมูลล้มเหลว: " + error.message);
        setTimeout(() => setSaveStatus(""), 3000);
      });
  };

  return (
    <div className="Formcontainer">
      <div className="nameHeader">
        <div>Function f(x)</div>
        <div>Lower bound (xL)</div>
        <div>Upper bound (xR)</div>
        <div>Tolerance (Error)</div>
      </div>
      <div className="data">
        <input placeholder="Function" value={fx} onChange={(e) => setFx(e.target.value)} />
        <input placeholder="Value of XL" value={xl} onChange={(e) => setXl(e.target.value)} />
        <input placeholder="Value of XR" value={xr} onChange={(e) => setXr(e.target.value)} />
        <input placeholder="Error" value={tolerance} onChange={(e) => setTolerance(e.target.value)} />
      </div>
      <button className="confirm" onClick={calculateBisection}>Confirm</button>
      {saveStatus && <div style={{ color: saveStatus.includes("ล้มเหลว") ? "red" : "green", marginTop: "10px" }}>{saveStatus}</div>}
      <h2>Result</h2>
      <table>
        <thead>
          <tr>
            <th>Iteration</th>
            <th>xL</th>
            <th>xR</th>
            <th>xM</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {result.map((row, idx) => (
            <tr key={idx}>
              <td>{row.iteration}</td>
              <td>{row.xL}</td>
              <td>{row.xR}</td>
              <td>{row.xM}</td>
              <td>{row.error}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}