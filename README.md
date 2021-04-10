# Cubing Cafe

## Team Members
- Justin Lyn (justin.lyn@mail.utoronto.ca)
- Ryan de Sao Jose (ryan.desaojose@mail.utoronto.ca)

## Important Links

- Website: https://thecubingcafe.herokuapp.com/
- YouTube Demo: https://youtu.be/3gsi5rDXtzQ
- API Documentation: [README.md](./api_docs)

## What is Cubing Cafe?

Cubing cafe is a web application that revolves around Rubik's cubes and is geared towards everyone from beginners all the way to the enthusiasts. For a full set of features and a more in-depth rundown, see below. 

## Key Features & Functions


### Solver

This feature is geared more towards the beginners learning how to solve as well as intermediate solvers who want to learn more algorithms (Particularly OLL & PLLs).

Users are able to input their cube scramble in two ways:

- Manually: Which is when the user manually selects each individual colour and arranges them on the map
- Scramble String: Users are also able to paste in a scramble string that they have

After inputting the desired cube scramble, the application will generate the solution and brake it down into 4 main steps. Corners, first 2 layers, orient last layer, permute last layer. This method is also known as CFOP which is the most popular solving method for beginners and intermediates. At each step users are able to see a 3D visualization of the cube and can view and rotate the cube at each step to make sure they are on the right track.

A handy notation cheat sheet is also provided for beginners who may not know the formal rotation notations.


### Timer

Geared for all levels, the timer is a way for users to track their solves and progress they make along the way. The timer revolves around sessions and so when a user returns to the page, all saved times for the most recent session are automatically loaded and the default cube size is set the last solved cube size for the session.

Solves are generated automatically for each new time and users can choose of whether or not to use it. Additionally, all solves are viewable as a picture when hovered over with the mouse.

- Viewable Stats: **Best Time, Last 5 avg, Last 12 avg**

- Available cube sizes: **2x2, 3x3, 4x4, 5x5, 6x6, 7x7**


### Online Versus

**Requirements**: Users are required to have a webcam in order to use this feature.

This is the second main feature of cubing cafe where users can battle it out in 1v1 fashion too see who can solve a given scramble the fastest. Users are put in a waiting queue to be matched with an opponent of similar elo (ranking). When one is found, both users scramble their cubes with the generated scramble, and once both users are satisfied with the cubes the match can start. After the countdown reaches 0 ..... **GO!**

On match completion, player stats are updated and can be viewed on the Leaderboard page.

Users are able to go again and find a new match if they so desire, otherwise they are free to navigate away once the match is complete.


### User Profiles

The profile page is where users can view the following information:

- Quick Stats: Solve statistics for their favourite cube (Cube that has been solved the most)
- History: Full history of all solves completed
    - Available filters: **Cube Size**
    - Svailable sort options: **Solve time, cube size, solve date**
- Cube Demographic: Visual breakdown of the users history based on cube size


### Leaderboard

Global leaderboard associated with the online versus feature where users can view their raking amongst others.
- Available sort options: **Elo, Wins, Losses**


## Technologies Used

- **Heroku** to host the web application
- **GraphQL** for building queries
- **Vue** as the frontend framework of choice
- **ExpressJS** to host run the backend
- **Vuetify** for consistent styling of UI elements
- **Vuex** for front-end state management
- **MongoDB** for storing and maintaining user and application data


## Technical Challenges

- GraphQL implementation and integration with mongoose and express
- WebRTC and peerJS utilization and user match making
- Vue lifecycle & Vuex state management

