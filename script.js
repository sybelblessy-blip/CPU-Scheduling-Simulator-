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

    document.getElementById("selected-algorithm").innerText =
        algorithmNames[algorithm];

    document.getElementById("input-section").innerHTML = `
        <h3>Process Configuration</h3>

        <label>Number of Processes:</label>

        <input type="number" id="processCount"
        min="1" max="20" placeholder="Enter number of processes">

        <br><br>

        <button onclick="generateInputs()">
            Generate Process Inputs
        </button>
    `;

    document.getElementById("results-section").innerHTML = "";
}


// GENERATE PROCESS INPUTS

function generateInputs() {

    let count = Number(document.getElementById("processCount").value);

    if (!Number.isInteger(count) || count < 1 || count > 20) {
        alert("Enter number of processes between 1 and 20.");
        return;
    }

    let html = `
        <h3>Enter Process Details</h3>

        <div class="table-container">
        <table>
            <tr>
                <th>Process</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                ${currentAlgorithm === "Priority" ? "<th>Priority</th>" : ""}
            </tr>
    `;

    for (let i = 0; i < count; i++) {

        html += `
            <tr>
                <td>P${i + 1}</td>

                <td>
                    <input type="number" id="at${i}"
                    min="0" value="0">
                </td>

                <td>
                    <input type="number" id="bt${i}"
                    min="1" value="1">
                </td>

                ${currentAlgorithm === "Priority" ? `
                <td>
                    <input type="number" id="pr${i}"
                    min="0" value="1">
                </td>` : ""}
            </tr>
        `;
    }

    html += `</table></div>`;

    if (currentAlgorithm === "RR") {
        html += `
            <br>
            <label>Time Quantum:</label>
            <input type="number" id="quantum" min="1" value="2">
        `;
    }

    html += `
        <br><br>
        <button onclick="calculateSchedule()">
            Calculate Scheduling
        </button>
    `;

    document.getElementById("input-section").innerHTML = html;

    document.getElementById("results-section").innerHTML = "";
}


// READ PROCESS DETAILS

function readProcesses() {

    let count = document.querySelectorAll("#input-section table tr").length - 1;

    let processes = [];

    for (let i = 0; i < count; i++) {

        let arrival = Number(document.getElementById("at" + i).value);
        let burst = Number(document.getElementById("bt" + i).value);

        if (!Number.isInteger(arrival) || arrival < 0 ||
            !Number.isInteger(burst) || burst < 1) {

            alert("Enter valid arrival and burst times.");
            return null;
        }

        let priority = 0;

        if (currentAlgorithm === "Priority") {

            priority = Number(document.getElementById("pr" + i).value);

            if (!Number.isInteger(priority) || priority < 0) {
                alert("Enter a valid priority.");
                return null;
            }
        }

        processes.push({
            pid: "P" + (i + 1),
            arrival: arrival,
            burst: burst,
            remaining: burst,
            priority: priority,
            completion: 0,
            index: i
        });
    }

    return processes;
}


// ADD GANTT SEGMENT

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


// FCFS, SJF AND PRIORITY

function nonPreemptive(processes, algorithm) {

    let time = 0;
    let completed = 0;
    let chart = [];

    while (completed < processes.length) {

        let available = processes.filter(p =>
            p.remaining > 0 && p.arrival <= time
        );

        if (available.length === 0) {

            let next = Math.min(...processes
                .filter(p => p.remaining > 0)
                .map(p => p.arrival));

            addSegment(chart, "Idle", time, next);
            time = next;
            continue;
        }

        available.sort((a, b) => {

            if (algorithm === "FCFS") {
                return a.arrival - b.arrival || a.index - b.index;
            }

            if (algorithm === "SJF") {
                return a.burst - b.burst ||
                    a.arrival - b.arrival || a.index - b.index;
            }

            return a.priority - b.priority ||
                a.arrival - b.arrival || a.index - b.index;
        });

        let p = available[0];

        let start = time;
        time += p.burst;

        addSegment(chart, p.pid, start, time);

        p.remaining = 0;
        p.completion = time;

        completed++;
    }

    return chart;
}


// SRTF

function srtf(processes) {

    let time = 0;
    let completed = 0;
    let chart = [];

    while (completed < processes.length) {

        let available = processes.filter(p =>
            p.remaining > 0 && p.arrival <= time
        );

        if (available.length === 0) {

            let next = Math.min(...processes
                .filter(p => p.remaining > 0)
                .map(p => p.arrival));

            addSegment(chart, "Idle", time, next);
            time = next;
            continue;
        }

        available.sort((a, b) =>
            a.remaining - b.remaining ||
            a.arrival - b.arrival ||
            a.index - b.index
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

function roundRobin(processes, quantum) {

    let time = 0;
    let completed = 0;
    let chart = [];
    let queue = [];

    let sorted = [...processes].sort((a, b) =>
        a.arrival - b.arrival || a.index - b.index
    );

    let next = 0;

    while (completed < processes.length) {

        while (next < sorted.length &&
            sorted[next].arrival <= time) {

            queue.push(sorted[next]);
            next++;
        }

        if (queue.length === 0) {

            let nextTime = sorted[next].arrival;

            addSegment(chart, "Idle", time, nextTime);

            time = nextTime;
            continue;
        }

        let p = queue.shift();

        let start = time;
        let runTime = Math.min(quantum, p.remaining);

        time += runTime;
        p.remaining -= runTime;

        addSegment(chart, p.pid, start, time);

        while (next < sorted.length &&
            sorted[next].arrival <= time) {

            queue.push(sorted[next]);
            next++;
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


// MAIN CALCULATION

function calculateSchedule() {

    processData = readProcesses();

    if (!processData) return;

    let chart = [];

    if (currentAlgorithm === "FCFS" ||
        currentAlgorithm === "SJF" ||
        currentAlgorithm === "Priority") {

        chart = nonPreemptive(processData, currentAlgorithm);
    }

    else if (currentAlgorithm === "SRTF") {
        chart = srtf(processData);
    }

    else if (currentAlgorithm === "RR") {

        let quantum = Number(document.getElementById("quantum").value);

        if (!Number.isInteger(quantum) || quantum < 1) {
            alert("Enter a valid time quantum.");
            return;
        }

        chart = roundRobin(processData, quantum);
    }

    showResults(chart);
}


// DISPLAY RESULTS

function showResults(chart) {

    let totalTAT = 0;
    let totalWT = 0;

    let html = `
        <h3>Gantt Chart</h3>

        <div class="gantt-container">
            <div class="gantt-chart">
    `;

    chart.forEach(segment => {

        let duration = segment.end - segment.start;

        html += `
            <div class="gantt-block ${segment.pid === "Idle" ? "idle" : ""}"
            style="flex:${duration}">
                ${segment.pid}
            </div>
        `;
    });

    html += `
            </div>

            <div class="gantt-times">
                <span>${chart.length ? chart[0].start : 0}</span>
    `;

    chart.forEach(segment => {
        html += `<span>${segment.end}</span>`;
    });

    html += `
            </div>
        </div>

        <h3>Scheduling Results</h3>

        <div class="table-container">
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

    processData.forEach(p => {

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
    });

    let avgTAT = totalTAT / processData.length;
    let avgWT = totalWT / processData.length;

    html += `
        </table>
        </div>

        <div class="average-box">
            <p>Average Turnaround Time: <strong>${avgTAT.toFixed(2)}</strong></p>
            <p>Average Waiting Time: <strong>${avgWT.toFixed(2)}</strong></p>
        </div>

        <button onclick="calculateSchedule()">Recalculate</button>
        <button onclick="goHome()" class="back-button">Choose Another Algorithm</button>
    `;

    document.getElementById("results-section").innerHTML = html;

    document.getElementById("results-section").scrollIntoView({
        behavior: "smooth"
    });
}


// GO BACK HOME

function goHome() {

    document.getElementById("simulation-screen").style.display = "none";
    document.getElementById("home-screen").style.display = "block";

    document.getElementById("input-section").innerHTML = "";
    document.getElementById("results-section").innerHTML = "";

    window.scrollTo(0, 0);
}