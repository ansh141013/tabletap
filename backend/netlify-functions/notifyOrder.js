exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        body: JSON.stringify({message: "Order notification sent (Placeholder)"})
    };
}
