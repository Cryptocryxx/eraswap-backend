import { getAllUsers, createUser } from '../databases/databaseUser.js';


async function registerUser() {
    const newId = await createUser({
        username: 'newuser',
        firstname: 'Lorenzo',
        lastname: 'Bauscher',
        birthday: new Date('2000-01-01'),
    });
    console.log('Inserted user ID:', newId);
    const users = await getAllUsers();
    console.table(users);
}
export { registerUser };

async function loginUser() {
    // Implement login logic here
    console.log('User logged in');
}

async function getUserProfile(req, res) {
    const userID = req.params.userID;
    // Implement logic to get user profile by userID
    res.send(`User profile for ID: ${userID}`);
}

async function updateUserProfile(req, res) {
    const userID = req.params.userID;
    // Implement logic to update user profile by userID
    res.send(`Updated user profile for ID: ${userID}`);
}

async function deleteUserAccount(req, res) {
    const userID = req.params.userID;
    // Implement logic to delete user account by userID
    res.send(`Deleted user account for ID: ${userID}`);
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUserAccount
};
