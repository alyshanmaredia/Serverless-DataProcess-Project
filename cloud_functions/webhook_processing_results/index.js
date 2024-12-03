import axios from 'axios';

export async function getResults(req, res) {
    try {
        const referanceCode = req.body.intentInfo.parameters.referance_code.originalValue;
        let responseMessage = "There is a problem accessing the results for this code.";
        

        try {
          const url = "https://pg70ny2xv0.execute-api.us-east-1.amazonaws.com/dev/getResult?process_id=" + referanceCode;
          const prossingResault = await axios.get(url);
          const filePath = prossingResault.data?.FileKey;
          const s3Url = `https://dataprocessorinputdal1.s3.amazonaws.com/${encodeURIComponent(filePath)}`;
          responseMessage = s3Url;
        } catch (axiosError) {
          console.error('Error fetching QDP agent:', axiosError.message);
          responseMessage = 'Failed to get processing results for this code. Please try again later.'
        }
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
