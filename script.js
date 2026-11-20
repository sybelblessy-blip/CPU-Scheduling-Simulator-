let currentAlgorithm = "";
let processData = [];

const algorithmNames = {
    FCFS: "First Come First Serve",
    SJF: "Shortest Job First",
    SRTF: "Shortest Remaining Time First",
    Priority: "Priority Scheduling",
    RR: "Round Robin"
};


// SELECT ALGORITHM

function selectAlgorithm(algorithm) {

    currentAlgorithm = algorithm;

    document.getElementById("home-screen").style.display = "none";
    document.getElementById("simulation-screen").style.display = "block";

    document.getElementById("selected-algorithm").textContent =
        algorithmNames[algorithm];

    document.getElementById("results-section").innerHTML = "";

    document.getElementById("input-section").innerHTML = `

        <h3>Process Configuration</h3>

        <label>Number of Processes</label>

        <input type="number" id="processCount"
        min="1" max="20" placeholder="Enter number of processes">

        <button onclick="generateInputs()">
            Generate Process Inputs
        </button>

        <div id="process-inputs"></div>
    `;

    window.scrollTo(0, 0);
}


// GO BACK HOME

function goHome() {

    document.getElementById("home-screen").style.display = "block";
    document.getElementById("simulation-screen").style.display = "none";

    window.scrollTo(0, 0);
}


// GENERATE PROCESS INPUTS

function generateInputs() {

    const count = Number(document.getElementById("processCount").value);

    if (!Number.isInteger(count) || count < 1 || count > 20) {
        alert("Enter between 1 and 20 processes.");
        return;
    }

    let html = "<h3>Enter Process Details</h3>";

    for (let i = 1; i <= count; i++) {

        html += `
            <div class="algorithm-card">

                <h3>Process P${i}</h3>

                <label>Arrival Time</label>
                <input type="number" id="at${i}" min="0" step="1" value="0">

                <label>Burst Time</label>
                <input type="number" id="bt${i}" min="1" step="1" value="1">
        `;

        if (currentAlgorithm === "Priority") {

            html += `
                <label>Priority (smaller number = higher priority)</label>
                <input type="number" id="pr${i}" step="1" value="1">
            `;
        }

        html += "</div>";
    }

    if (currentAlgorithm === "RR") {

        html += `
            <label>Time Quantum</label>
            <input type="number" id="quantum" min="1" step="1" value="2">
        `;
    }

    html += `
        <br>
        <button onclick="calculateScheduling()">
            Calculate Scheduling
        </button>
    `;

    document.getElementById("process-inputs").innerHTML = html;
}


// READ PROCESS DATA

function readProcesses() {

    const count = Number(document.getElementById("processCount").value);

    let processes = [];

    for (let i = 1; i <= count; i++) {

        const arrival = Number(document.getElementById("at" + i).value);
        const burst = Number(document.getElementById("bt" + i).value);

        if (!Number.isInteger(arrival) || arrival < 0 ||
            !Number.isInteger(burst) || burst <= 0) {

            alert("Enter valid non-negative arrival times and positive integer burst times.");
            return null;
        }

        let priority = 0;

        if (currentAlgorithm === "Priority") {

            priority = Number(document.getElementById("pr" + i).value);

            if (!Number.isInteger(priority)) {
                alert("Enter a valid integer priority.");
                return null;
            }
        }

        processes.push({
            pid: "P" + i,
            arrival: arrival,
            burst: burst,
            remaining: burst,
            priority: priority,
            completion: 0,
            order: i
        });
    }

    return processes;
}


// ADD GANTT CHART SEGMENT

function addSegment(chart, pid, start, end) {

    if (end <= start) return;

    let last = chart[chart.length - 1];

    if (last && last.pid === pid && last.end === start) {
        last.end = end;
    } else {
        chart.push({
            pid: pid,
            start: start,
            end: end
        });
    }
}


// FCFS ALGORITHM

function runFCFS(processes) {

    let chart = [];
    let time = 0;

    let sorted = [...processes].sort(
        (a, b) => a.arrival - b.arrival || a.order - b.order
    );

    for (let p of sorted) {

        if (time < p.arrival) {
            addSegment(chart, "Idle", time, p.arrival);
            time = p.arrival;
        }

        let start = time;

        time += p.burst;

        p.completion = time;

        addSegment(chart, p.pid, start, time);
    }

    return chart;
}


// SJF NON-PREEMPTIVE

function runSJF(processes) {

    let chart = [];
    let time = 0;
    let completed = 0;

    while (completed < processes.length) {

        let available = processes.filter(
            p => p.completion === 0 && p.arrival <= time
        );

        if (available.length === 0) {

            let next = Math.min(
                ...processes
                    .filter(p => p.completion === 0)
                    .map(p => p.arrival)
            );

            addSegment(chart, "Idle", time, next);
            time = next;
            continue;
        }

        available.sort(
            (a, b) => a.burst - b.burst ||
                      a.arrival - b.arrival ||
                      a.order - b.order
        );

        let p = available[0];

        let start = time;
        time += p.burst;

        p.completion = time;

        addSegment(chart, p.pid, start, time);

        completed++;
    }

    return chart;
}


// PRIORITY NON-PREEMPTIVE

function runPriority(processes) {

    let chart = [];
    let time = 0;
    let completed = 0;

    while (completed < processes.length) {

        let available = processes.filter(
            p => p.completion === 0 && p.arrival <= time
        );

        if (available.length === 0) {

            let next = Math.min(
                ...processes
                    .filter(p => p.completion === 0)
                    .map(p => p.arrival)
            );

            addSegment(chart, "Idle", time, next);
            time = next;
            continue;
        }

        available.sort(
            (a, b) => a.priority - b.priority ||
                      a.arrival - b.arrival ||
                      a.order - b.order
        );

        let p = available[0];

        let start = time;
        time += p.burst;

        p.completion = time;

        addSegment(chart, p.pid, start, time);

        completed++;
    }

    return chart;
}


// SRTF PREEMPTIVE

function runSRTF(processes) {

    let chart = [];
    let time = 0;
    let completed = 0;

    while (completed < processes.length) {

        let available = processes.filter(
            p => p.remaining > 0 && p.arrival <= time
        );

        if (available.length === 0) {

            let next = Math.min(
                ...processes
                    .filter(p => p.remaining > 0)
                    .map(p => p.arrival)
            );

            addSegment(chart, "Idle", time, next);
            time = next;
            continue;
        }

        available.sort(
            (a, b) => a.remaining - b.remaining ||
                      a.arrival - b.arrival ||
                      a.order - b.order
        );

        let p = available[0];

        addSegment(chart, p.pid, time, time + 1);

        p.remaining--;
        time++;

        if (p.remaining === 0) {
            p.completion = time;
            completed++;
        }
    }

    return chart;
}


// ROUND ROBIN

function runRR(processes, quantum) {

    let chart = [];
    let queue = [];

    let time = 0;
    let completed = 0;

    let sorted = [...processes].sort(
        (a, b) => a.arrival - b.arrival || a.order - b.order
    );

    let index = 0;

    while (completed < processes.length) {

        while (index < sorted.length &&
               sorted[index].arrival <= time) {

            queue.push(sorted[index]);
            index++;
        }

        if (queue.length === 0) {

            let next = sorted[index].arrival;

            addSegment(chart, "Idle", time, next);
            time = next;
            continue;
        }

        let p = queue.shift();

        let runTime = Math.min(quantum, p.remaining);

        let start = time;

        time += runTime;
        p.remaining -= runTime;

        addSegment(chart, p.pid, start, time);

        while (index < sorted.length &&
               sorted[index].arrival <= time) {

            queue.push(sorted[index]);
            index++;
        }

        if (p.remaining > 0) {
            queue.push(p);
        } else {
            p.completion = time;
            completed++;
        }
    }

    return chart;
}


// CALCULATE SCHEDULING

function calculateScheduling() {

    processData = readProcesses();

    if (!processData) return;

    let chart = [];

    if (currentAlgorithm === "FCFS") {
        chart = runFCFS(processData);
    }

    else if (currentAlgorithm === "SJF") {
        chart = runSJF(processData);
    }

    else if (currentAlgorithm === "SRTF") {
        chart = runSRTF(processData);
    }

    else if (currentAlgorithm === "Priority") {
        chart = runPriority(processData);
    }

    else if (currentAlgorithm === "RR") {

        let quantum = Number(document.getElementById("quantum").value);

        if (!Number.isInteger(quantum) || quantum <= 0) {
            alert("Enter a valid positive integer time quantum.");
            return;
        }

        chart = runRR(processData, quantum);
    }

    displayResults(chart);
}


// DISPLAY RESULTS

function displayResults(chart) {

    let totalTAT = 0;
    let totalWT = 0;

    let html = `
        <h2>Simulation Results</h2>

        <h3>Gantt Chart</h3>

        <div class="gantt-chart">
    `;

    for (let block of chart) {

        let duration = block.end - block.start;

        html += `
            <div class="gantt-block ${block.pid === "Idle" ? "idle" : ""}"
                 style="flex-grow:${duration}">

                <strong>${block.pid}</strong>

                <small>${block.start} - ${block.end}</small>

            </div>
        `;
    }

    html += `
        </div>

        <h3>Process Details</h3>

        <div style="overflow-x:auto">
        <table>
            <tr>
                <th>Process</th>
                <th>AT</th>
                <th>BT</th>
                <th>CT</th>
                <th>TAT</th>
                <th>WT</th>
            </tr>
    `;

    for (let p of processData) {

        let tat = p.completion - p.arrival;
        let wt = tat - p.burst;

        totalTAT += tat;
        totalWT += wt;

        html += `
            <tr>
                <td>${p.pid}</td>
                <td>${p.arrival}</td>
                <td>${p.burst}</td>
                <td>${p.completion}</td>
                <td>${tat}</td>
                <td>${wt}</td>
            </tr>
        `;
    }

    let avgTAT = totalTAT / processData.length;
    let avgWT = totalWT / processData.length;

    html += `
        </table>
        </div>

        <div class="averages">
            <p>Average Turnaround Time</p>
            <h3>${avgTAT.toFixed(2)}</h3>

            <p>Average Waiting Time</p>
            <h3>${avgWT.toFixed(2)}</h3>
        </div>

        <button onclick="resetSimulation()">Reset</button>
    `;

    const results = document.getElementById("results-section");

    results.innerHTML = html;

    results.scrollIntoView({ behavior: "smooth" });
}


// RESET

function resetSimulation() {

    document.getElementById("input-section").innerHTML = `
        <h3>Process Configuration</h3>

        <label>Number of Processes</label>

        <input type="number" id="processCount"
        min="1" max="20" placeholder="Enter number of processes">

        <button onclick="generateInputs()">
            Generate Process Inputs
        </button>
    `;

    document.getElementById("results-section").innerHTML = "";

    window.scrollTo(0, 0);
}