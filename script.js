function selectAlgorithm(algorithm) {

    const inputSection = document.getElementById("input-section");
    const selectedAlgorithm = document.getElementById("selected-algorithm");

    inputSection.style.display = "block";

    if (algorithm === "FCFS") {
        selectedAlgorithm.innerHTML = "FCFS - First Come First Serve";
    }
    else if (algorithm === "SJF") {
        selectedAlgorithm.innerHTML = "SJF - Shortest Job First";
    }
    else if (algorithm === "SRTF") {
        selectedAlgorithm.innerHTML = "SRTF - Shortest Remaining Time First";
    }
    else if (algorithm === "Priority") {
        selectedAlgorithm.innerHTML = "Priority Scheduling";
    }
    else if (algorithm === "RR") {
        selectedAlgorithm.innerHTML = "Round Robin Scheduling";
    }

    inputSection.scrollIntoView({
        behavior: "smooth"
    });
}
