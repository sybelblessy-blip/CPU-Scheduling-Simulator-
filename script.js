function selectAlgorithm(algorithm) {

    const section = document.getElementById("input-section");

    let title = "";

    const names = {
        FCFS: "First Come First Serve",
        SJF: "Shortest Job First",
        SRTF: "Shortest Remaining Time First",
        Priority: "Priority Scheduling",
        RR: "Round Robin Scheduling"
    };

    title = names[algorithm];

    section.style.display = "block";

    section.innerHTML = `
        <h2>${title}</h2>

        <label>Number of Processes:</label>
        <input type="number" id="processCount" min="1" max="20"
        placeholder="Enter number of processes">

        <button onclick="generateInputs('${algorithm}')">
            Generate Process Inputs
        </button>

        <div id="process-inputs"></div>
    `;

    section.scrollIntoView({ behavior: "smooth" });
}


function generateInputs(algorithm) {

    const count = Number(document.getElementById("processCount").value);

    if (!Number.isInteger(count) || count < 1 || count > 20) {
        alert("Enter a number of processes between 1 and 20.");
        return;
    }

    let html = "<h3>Enter Process Details</h3>";

    for (let i = 1; i <= count; i++) {

        html += `
            <div class="algorithm-card">
                <h3>Process P${i}</h3>

                <label>Arrival Time:</label>
                <input type="number" id="at${i}" min="0" value="0">

                <label>Burst Time:</label>
                <input type="number" id="bt${i}" min="1" value="1">
        `;

        if (algorithm === "Priority") {
            html += `
                <label>Priority:</label>
                <input type="number" id="pr${i}" value="1">
            `;
        }

        html += "</div>";
    }

    if (algorithm === "RR") {
        html += `
            <label>Time Quantum:</label>
            <input type="number" id="quantum" min="1" value="2">
        `;
    }

    html += `
        <br>
        <button onclick="alert('Next we will add the scheduling calculation!')">
            Calculate
        </button>
    `;

    document.getElementById("process-inputs").innerHTML = html;
}