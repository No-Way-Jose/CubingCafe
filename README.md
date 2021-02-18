# Cubing Cafe

## Team Members
- Justin Lyn (justin.lyn@mail.utoronto.ca)
- Ryan de Sao Jose (ryan.desaojose@mail.utoronto.ca)

## App Idea

The web application will be centered around various features pertaining to solving Rubik's cubes. It will appeal to beginners by providing a way to learn how to solve and advanced cubers by providing a way to track their progress.

### Key Features for Beta
- Solver
    - User can input their current cube state
        - Image recognition, user can upload image of cube
        - Or they can do it manually by selecting colours
    - Solver will then go step by step to teach the beginners method with visual aids
- Timer
    - Generate random scrambles (for 3x3x3)
    - Dropdown to select cube size
        - Times will then be saved to the user profile according to the size set
    - show last 5 solve times

### Additional Features for Final version
- User Profile
    - Per cube size
        - Line graph of their solve times
        - ability to calculate average over different ranges
- Leaderboards
    - Ordered list of best solve times

## Technologies
- GraphQL for building queries
- Google Charts for displaying charts to users for their solves
- VueJS for developing the frontend
- Firebase for hosting and database
- Firebase authentication - email or Google signup
- ExpressJS to build the API
- Vuetify for consistent styling of UI elements
- three-rubiks-cube to show the state and moves to the user in solver
- Vuex front-end state management

## Technical Challenges
- Developing solver for cube
- Image recognition on a cube to determine current state
- Manual cube state editor
- Setting initial unsolved state of three-rubiks-cube
- Connecting GraphQL with Firebase



