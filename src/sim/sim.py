from flask import Flask, jsonify
from flask_cors import CORS
from mesa import Agent, Model
from mesa.space import MultiGrid
from mesa import RandomActivation
import random

app = Flask(__name__)
CORS(app)

# ---------- Agent ----------
class RandomWalker(Agent):
    def step(self):
        possible_steps = self.model.grid.get_neighborhood(
            self.pos, moore=True, include_center=False
        )
        self.model.grid.move_agent(self, random.choice(possible_steps))

# ---------- Model ----------
class RandomWalkModel(Model):
    def __init__(self, width=20, height=20, n_agents=10):
        self.grid = MultiGrid(width, height, torus=True)
        self.schedule = RandomActivation(self)

        for i in range(n_agents):
            a = RandomWalker(i, self)
            self.schedule.add(a)
            self.grid.place_agent(a, (random.randrange(width), random.randrange(height)))

    def step(self):
        self.schedule.step()

    def get_agent_positions(self):
        return [
            {
                "id": a.unique_id,
                "x": a.pos[0],
                "y": a.pos[1]
            }
            for a in self.schedule.agents
        ]

model = RandomWalkModel()

@app.route("/step")
def step():
    model.step()
    return jsonify(model.get_agent_positions())

if __name__ == "__main__":
    app.run(debug=True)

