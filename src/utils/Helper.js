import bcrypt from "bcrypt";
class Helpers{
   constructor(user){
    console.log('user from helpers',user[0].password)
    this.user=user
   }

    isPasswordCorrect= async function (password) {
        return await bcrypt.compare(password, this.user[0].password);
      };
}
export {Helpers}