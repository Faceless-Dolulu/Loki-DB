module.exports = (oldMessage, newMessage, client, handler) => {
    console.log(
        `Message edited from ${oldMessage.content} to ${newMessage.content}.`
    );
};