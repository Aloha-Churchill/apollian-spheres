import numpy as np
from itertools import product
import matplotlib.pyplot as plt
from dataclasses import dataclass

@dataclass
class Circle:
    centroid: np.ndarray
    radius: float
    generation_level: str
    solution_set: int


def check_combinations(): 
    # base case
    base_arr = np.array([[1, 0, 1],
                         [0, 1, 1],
                         [1, 1, 0]])
    
    elements = ["A", "B", "C"]
    groups = {
        "A": [1, 1],
        "B": [-1, 1],
        "C": [1, -1]
    }
    cartesian_products = list(product(elements, repeat=3))
    solutions = []
    for choice in cartesian_products:
        m = np.array([[groups[choice[0]][0], 0, groups[choice[0]][1]],
                       [0, groups[choice[1]][0], groups[choice[1]][1]],
                       [groups[choice[2]][0], groups[choice[2]][1], 0]])
        
        det = np.linalg.det(m)
        if det != 0:
            solutions.append(m.tolist())

    return solutions

def solve_matrices(matrices, points):
    # find euclidean distances between each pair of points
    distances = [np.linalg.norm(points[0] - points[2]),
                 np.linalg.norm(points[1] - points[2]),
                 np.linalg.norm(points[0] - points[1])]

    solutions = []
    for m in matrices:
        x = np.linalg.solve(m, distances)
        if x[0] > 0 and x[1] > 0 and x[2] > 0:
            solutions.append(x)

    return solutions

def generate_base_circles():
    # generate three random points
    centroids = np.random.randint(0, 10, size=(3, 2))
    possible_arrays = check_combinations()
    radii = solve_matrices(possible_arrays, centroids)
    print(f'Generation circles')

    circles = []
    for i in range(len(radii)):
        c1 = Circle(centroids[0], radii[i][0], "base", i)
        c2 = Circle(centroids[1], radii[i][1], "base", i)
        c3 = Circle(centroids[2], radii[i][2], "base", i)
        circles.extend([c1, c2, c3])

    return circles


def generate_soddy_circles(centroids, radii_set, radii_set_index):
    # find outer Soddy centroid in Barycentric coordinaes
    # find the area of the triangle given by the centroids
    soddy_triangle = {
        "A": centroids[0],
        "B": centroids[1],
        "C": centroids[2],
        "a": np.linalg.norm(centroids[1] - centroids[2]),
        "b": np.linalg.norm(centroids[0] - centroids[2]),
        "c": np.linalg.norm(centroids[0] - centroids[1]),
        "angle_A": np.arccos((np.linalg.norm(centroids[1] - centroids[2])**2 - np.linalg.norm(centroids[0] - centroids[1])**2 - np.linalg.norm(centroids[0] - centroids[2])**2) / (-2 * np.linalg.norm(centroids[0] - centroids[1]) * np.linalg.norm(centroids[0] - centroids[2]))),
        "angle_B": np.arccos((np.linalg.norm(centroids[0] - centroids[2])**2 - np.linalg.norm(centroids[1] - centroids[0])**2 - np.linalg.norm(centroids[1] - centroids[2])**2) / (-2 * np.linalg.norm(centroids[1] - centroids[0]) * np.linalg.norm(centroids[1] - centroids[2]))),
        "angle_C": np.arccos((np.linalg.norm(centroids[0] - centroids[1])**2 - np.linalg.norm(centroids[2] - centroids[0])**2 - np.linalg.norm(centroids[2] - centroids[1])**2) / (-2 * np.linalg.norm(centroids[2] - centroids[0]) * np.linalg.norm(centroids[2] - centroids[1]))),
        "r1": radii_set[0],
        "r2": radii_set[1],
        "r3": radii_set[2]
    }
    soddy_triangle["area"] = 0.5 * soddy_triangle["b"] * soddy_triangle["c"] * np.sin(soddy_triangle["angle_A"])


    # find the outer Soddy circle centroid
    def find_outer_centroid():
        alpha = 1 - (2*soddy_triangle["area"] / (soddy_triangle["a"] * (soddy_triangle["b"] + soddy_triangle["c"] - soddy_triangle["a"])))
        beta = 1 - (2*soddy_triangle["area"] / (soddy_triangle["b"] * (soddy_triangle["a"] + soddy_triangle["c"] - soddy_triangle["b"])))
        gamma = 1 - (2*soddy_triangle["area"] / (soddy_triangle["c"] * (soddy_triangle["a"] + soddy_triangle["b"] - soddy_triangle["c"])))

        centroid_x = (soddy_triangle["a"] * alpha * centroids[0][0] + soddy_triangle["b"] * beta * centroids[1][0] + soddy_triangle["c"] * gamma * centroids[2][0]) / (soddy_triangle["a"] * alpha + soddy_triangle["b"] * beta + soddy_triangle["c"] * gamma)
        centroid_y = (soddy_triangle["a"] * alpha * centroids[0][1] + soddy_triangle["b"] * beta * centroids[1][1] + soddy_triangle["c"] * gamma * centroids[2][1]) / (soddy_triangle["a"] * alpha + soddy_triangle["b"] * beta + soddy_triangle["c"] * gamma)

        return [centroid_x, centroid_y]

    def find_inner_centroid():
        alpha = 1 + (1.0 / np.cos(0.5*soddy_triangle["angle_A"])) * np.cos(0.5*soddy_triangle["angle_B"]) * np.cos(0.5*soddy_triangle["angle_C"])
        beta = 1 + (1.0 / np.cos(0.5*soddy_triangle["angle_B"])) * np.cos(0.5*soddy_triangle["angle_A"]) * np.cos(0.5*soddy_triangle["angle_C"])
        gamma = 1 + (1.0 / np.cos(0.5*soddy_triangle["angle_C"])) * np.cos(0.5*soddy_triangle["angle_A"]) * np.cos(0.5*soddy_triangle["angle_B"])

        centroid_x = (soddy_triangle["a"] * alpha * centroids[0][0] + soddy_triangle["b"] * beta * centroids[1][0] + soddy_triangle["c"] * gamma * centroids[2][0]) / (soddy_triangle["a"] * alpha + soddy_triangle["b"] * beta + soddy_triangle["c"] * gamma)
        centroid_y = (soddy_triangle["a"] * alpha * centroids[0][1] + soddy_triangle["b"] * beta * centroids[1][1] + soddy_triangle["c"] * gamma * centroids[2][1]) / (soddy_triangle["a"] * alpha + soddy_triangle["b"] * beta + soddy_triangle["c"] * gamma)

        return [centroid_x, centroid_y]
    
    outer_centroid = find_outer_centroid()
    inner_centroid = find_inner_centroid()

    inner_radius = (soddy_triangle["r1"]*soddy_triangle["r2"]*soddy_triangle["r3"]) / (soddy_triangle["r2"]*soddy_triangle["r3"] + soddy_triangle["r1"]*soddy_triangle["r3"] + soddy_triangle["r1"]*soddy_triangle["r2"] + 2*soddy_triangle["area"])
    outer_radius = (soddy_triangle["r1"]*soddy_triangle["r2"]*soddy_triangle["r3"]) / (soddy_triangle["r2"]*soddy_triangle["r3"] + soddy_triangle["r1"]*soddy_triangle["r3"] + soddy_triangle["r1"]*soddy_triangle["r2"] - 2*soddy_triangle["area"])
    
    print(f'Inner radius: {inner_radius}')
    print(f'Inner centroid: {inner_centroid}')
    print(f'Outer radius: {outer_radius}')
    print(f'Outer centroid: {outer_centroid}')

    # generate circle objects
    inner_circle = Circle(inner_centroid, inner_radius, "soddy", radii_set_index)
    outer_circle = Circle(outer_centroid, outer_radius, "soddy", radii_set_index)

    # return the inner and outer Soddy circles centroids and radii
    return [inner_circle, outer_circle]


def vizualize_circles(circles):
    num_sets = max([c.solution_set for c in circles]) + 1
    fig, axs = plt.subplots(1, num_sets, figsize=(15,5))
    
    colors = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'brown', 'pink', 'gray', 'olive', 'cyan']
    
    # Extracting all x and y coordinates to set limits and aspect ratio correctly
    x_coords = [c.centroid[0] for c in circles]
    y_coords = [c.centroid[1] for c in circles]
    
    # Extracting all radii to set limits and aspect ratio correctly
    all_radii = [c.radius for c in circles]

    # Global limits for all subplots
    x_lim = (min(x_coords) - max(all_radii) - 1, max(x_coords) + max(all_radii) + 1)
    y_lim = (min(y_coords) - max(all_radii) - 1, max(y_coords) + max(all_radii) + 1)

    # Iterate over each set of circles
    for i, ax in enumerate(axs):
        # Extracting circles for current set
        current_circles = [c for c in circles if c.solution_set == i]

        for c in current_circles:
            color = colors[i % len(colors)] if c.generation_level == "base" else 'black'
            circle = plt.Circle(c.centroid, c.radius, fill=False, edgecolor=color, linewidth=1.5)
            ax.scatter(c.centroid[0], c.centroid[1], c=color, marker='+')
            ax.add_artist(circle)
        
        ax.set_aspect(1)
        ax.set_xlim(*x_lim)
        ax.set_ylim(*y_lim)
        ax.grid()

    plt.tight_layout()
    plt.show()

    
if __name__ == "__main__":
    base_circles = generate_base_circles()
    # generate soddy circles
    centroids_0 = np.array([c.centroid for c in base_circles if c.solution_set == 0])
    radii_0 = np.array([c.radius for c in base_circles if c.solution_set == 0])
    soddy_circles_0 = generate_soddy_circles(centroids_0, radii_0, 0)

    centroids_1 = np.array([c.centroid for c in base_circles if c.solution_set == 1])
    radii_1 = np.array([c.radius for c in base_circles if c.solution_set == 1])
    soddy_circles_1 = generate_soddy_circles(centroids_1, radii_1, 1)

    centroids_2 = np.array([c.centroid for c in base_circles if c.solution_set == 2])
    radii_2 = np.array([c.radius for c in base_circles if c.solution_set == 2])
    soddy_circles_2 = generate_soddy_circles(centroids_2, radii_2, 2)

    centroids_3 = np.array([c.centroid for c in base_circles if c.solution_set == 3])
    radii_3 = np.array([c.radius for c in base_circles if c.solution_set == 3])
    soddy_circles_3 = generate_soddy_circles(centroids_3, radii_3, 3)


    all_circles = base_circles + soddy_circles_0 + soddy_circles_1 + soddy_circles_2 + soddy_circles_3


    # # for each set of radii, add teh soddy radii
    # new_radii = []
    # for set in radii:
    #     new_radii.append(np.append(set, soddy_radii))

    # radii = np.array(new_radii)

    print(f'Base circles: {base_circles}')
    print(f'Soddy circles: {soddy_circles_0}')
    vizualize_circles(all_circles)