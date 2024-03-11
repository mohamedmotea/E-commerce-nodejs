import { Server } from "socket.io"
let io
export function generateIo(server){
   io = new Server(server,{
    cors:{
      origin:"*"
    }
   })
  return io
}
// return io 
function Io(){ return io}
export default Io