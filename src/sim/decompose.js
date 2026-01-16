
async function fetchAgents() {
    const response = await fetch("http://localhost:5000/step");
    const agents = await response.json();
    console.log(agents);
    return agents;
}
