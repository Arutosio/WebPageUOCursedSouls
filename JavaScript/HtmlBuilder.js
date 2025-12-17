import UtilityClass from './UtilityClass.js';

export default class HtmlBuilder {
    constructor(pathTemplate) {
        this.pathTemplate = pathTemplate;
    }

    async GetStringView(fileName) {
        let path = `${this.pathTemplate}/${fileName}`;
        let stringHtml = await UtilityClass.GetTextFromFile(path);
        return stringHtml;
    }

    // #region Section-Product
    static async RepalceKeysDataInfoOnString(string, jsonDataInfo) {
        string = HtmlBuilder.RepleaceAllKey(string, "title", jsonDataInfo.title);
        string = HtmlBuilder.RepleaceAllKey(string, "footerText", jsonDataInfo.footerText);
        string = HtmlBuilder.RepleaceAllKey(string, "address", jsonDataInfo.address);
        string = HtmlBuilder.RepleaceAllKey(string, "phone", jsonDataInfo.phone);
        string = HtmlBuilder.RepleaceAllKey(string, "mobilePhone", jsonDataInfo.mobilePhone);
        string = HtmlBuilder.RepleaceAllKey(string, "eMail", jsonDataInfo.eMail);
        string = HtmlBuilder.RepleaceAllKey(string, "facebook", jsonDataInfo.facebook);
        string = HtmlBuilder.RepleaceAllKey(string, "instagram", jsonDataInfo.instagram);
        string = HtmlBuilder.RepleaceAllKey(string, "whatsApp", jsonDataInfo.whatsApp);
        return string;
    }

    static async RepalceKeysDataInfoOfBachecaMessage(string, jsonDataInfoBachecaMessage) {
        string = HtmlBuilder.RepleaceAllKey(string, "fa_icon", jsonDataInfoBachecaMessage.fa_icon);
        string = HtmlBuilder.RepleaceAllKey(string, "bachecaMsg", jsonDataInfoBachecaMessage.bachecaMsg);
        return string;
    }
    // #endregion Section-Product

    // #region Utility-Methods 
    static RepleaceKey(mainStr, keyword, replaceStr) {
        let htmlEdit;
        let keywordAdapted = `:|§.${keyword}.§|:`;
        // if(replaceStr !== null && replaceStr !== '') {
        htmlEdit = mainStr.replace(keywordAdapted, replaceStr);
        // } else {
        //     htmlEdit = mainStr.replace(keywordAdapted, '');
        // }
        return htmlEdit;
    }

    static RepleaceAllKey(mainStr, keyword, replaceStr) {
        if (!mainStr){ // || typeof mainStr !== "string") {
            console.error("mainStr non è una stringa valida:", mainStr);
            return ""; // Restituisci una stringa vuota in caso di errore
        }
        let htmlEdit = String(mainStr);
        let keywordAdapted = `:|§.${keyword}.§|:`;
        do {
            htmlEdit = htmlEdit.replace(keywordAdapted, replaceStr);
        } while (htmlEdit.split(keywordAdapted).length > 1);
        return htmlEdit;
    }
    // #endregion Utility-Methods 
}