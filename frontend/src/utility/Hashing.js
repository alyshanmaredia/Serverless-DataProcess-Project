import CryptoJS from "crypto-js";

export default function hashAnswer(input) {
	return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}
