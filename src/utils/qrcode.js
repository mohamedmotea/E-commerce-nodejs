import QRCode  from "qrcode"

const generateQrCode = async(data)=>{
  return await QRCode.toDataURL(JSON.stringify(data),{errorCorrectionLevel:'H'})
}

export default generateQrCode