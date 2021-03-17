

const getTextMessage = (senderUserName, text) => {
    const msgObj = {
        senderName: senderUserName,
        text: text,
        createdAt: new Date().getTime()

    }
    return msgObj;
}




const getUrlMessage = (senderUserName, coord) => {
    const msgObj = {
        senderName: senderUserName,
        url: `https://google.com/maps?q=${coord.lat},${coord.lon}`,
        createdAt: new Date().getTime()

    }
    return msgObj;
}

module.exports = {
    getTextMessage, getUrlMessage
}