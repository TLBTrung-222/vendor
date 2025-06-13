class Validates {
  validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+(com|org|net|edu|gov|mil|co|io|info|biz|me|us|ca|uk|de|fr|au|in|jp|cn|nl|br|ru|dev|app|shop|online|site|xyz|tech|ai|club|studio)$/.test(
      String(email).toLowerCase()
    );
  };

  validatePassword = (password: string) => {
    return /^.{6,}$/.test(password);
  };
}

const validates = new Validates();
export default validates;
