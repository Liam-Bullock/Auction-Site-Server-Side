import bcrypt from 'bcrypt';
const saltRounds = 10;



const hash = (password: string) =>
{
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashString = bcrypt.hashSync(password, salt);
    return hashString;
}


const compare = (plainTextPass: string, passwordHashed: string) =>
{
    const compareString = bcrypt.compareSync(plainTextPass, passwordHashed);
    return compareString;
}




export {hash, compare}