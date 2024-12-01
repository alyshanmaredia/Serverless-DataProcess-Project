export async function getResults(req, res) {
    try {
         const userMessage = req.body.text;
        // const referanceCode = req.body.intentInfo.parameters.referance_code.resolvedValue;
        const referanceCode = req.body.intentInfo.parameters.referance_code.originalValue;
        const responseMessage = "Testing file processing results for referance code: "+referanceCode;
        responseMessage += "\n\nIs there anything else I can assist you with Today?";
        res.json({ 
          fulfillment_response: {
            messages: [
              {
                text: {
                  text: [responseMessage]
                }
              }
            ]
          } 
        });
    } catch (error) {
        console.error("Error:", error);
        res.json({
            fulfillmentText: `There was an issue retriving the processed file results.`
        });
    }
}
