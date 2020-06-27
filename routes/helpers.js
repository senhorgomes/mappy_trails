
  function getUserByEmail(email, users) {
    for (let user in users) {
      if (users[user].email === email) {
        return users[user].id;
      }
    }
  };

  const authenticateUser = (email, users) => {
    const user = getUserByEmail(email, users);
    if (user) {
      return true;
    }
    return false;
  }

  function mapsForUser(userId, urlDatabase) {
    let result = {};
    for (let item in urlDatabase) {
      if (urlDatabase[item].userID === userId) {
        result[item] = urlDatabase[item];
      }
    }
    return result;
  }

  function isLoggedIn(cookieInfo) {
    const userId = cookieInfo.userId;
    if (userId) {
      return true;
    } else {
      return false;
    }
  }



module.exports = {getUserByEmail, authenticateUser, mapsForUser, isLoggedIn};
