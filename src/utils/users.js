const users = []

const addUser = (id, username, room) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        };
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        };
    }

    // Store user
    const user = { id: id, username: username, room: room };
    users.push(user);


    console.log(users);

    return user;
}

const removeUser = (removeId) => {
    const index = users.findIndex(x => x.id === removeId);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}