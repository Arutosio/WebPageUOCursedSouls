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
    /**
     * Metodo principale per la sostituzione dei dati nella stringa template.
     */
    static async RepalceKeysDataInfoOnString(string, jsonDataInfo) {
        let keysMap = [
            { key: "title", value: jsonDataInfo.title },
            { key: "footerText", value: jsonDataInfo.footerText },
            { key: "address", value: jsonDataInfo.address },
            { key: "phone", value: jsonDataInfo.phone },
            { key: "mobilePhone", value: jsonDataInfo.mobilePhone },
            { key: "eMail", value: jsonDataInfo.eMail },
            { key: "facebook", value: jsonDataInfo.facebook },
            { key: "instagram", value: jsonDataInfo.instagram },
            { key: "whatsApp", value: jsonDataInfo.whatsApp }
        ];

        // 1. Processo chiavi semplici
        string = await HtmlBuilder.ProcessSimpleKeys(string, keysMap);

        // 2. Processo lista Roadmap
        // string = await HtmlBuilder.ProcessRoadmapSection(string, jsonDataInfo);

        return string;
    }

    /**
     * Cicla le chiavi semplici ed esegue il replace se presenti.
     */
    static async ProcessSimpleKeys(string, keysMap) {
        for (let i = 0; i < keysMap.length; i++) {
            let item = keysMap[i];
            let placeholder = ":|§." + item.key + ".§|:";
            
            if (string.includes(placeholder) && item.value !== undefined) {
                string = HtmlBuilder.RepleaceAllKey(string, item.key, item.value || "");
            }
        }
        return string;
    }

    static async ReplaceKeysDataInfoOfRoadmapItems(htmlTemplate, item) {
        let output = htmlTemplate;

        // Sostituzione chiavi dirette dal JSON
        output = HtmlBuilder.RepleaceAllKey(output, "status", item.status);
        output = HtmlBuilder.RepleaceAllKey(output, "date_start", item.date_start);
        output = HtmlBuilder.RepleaceAllKey(output, "date_end", item.date_end);
        output = HtmlBuilder.RepleaceAllKey(output, "title", item.title);
        output = HtmlBuilder.RepleaceAllKey(output, "image_url", item.image_url);
        output = HtmlBuilder.RepleaceAllKey(output, "description", item.description);

        return output;
    }

    /**
     * Gestisce specificamente la logica della sezione Roadmap.
     */
    static async ProcessRoadmapSection(string, jsonDataInfo, roadmap_item_html) {
        let roadmapPlaceholder = ":|§.roadmap_items.§|:";
        
        if (!string.includes(roadmapPlaceholder)) {
            return string;
        }

        let hasItems = jsonDataInfo.roadmap && 
                    Array.isArray(jsonDataInfo.roadmap.items) && 
                    jsonDataInfo.roadmap.items.length > 0;

        if (hasItems) {
            let roadmapHtml = "";
            let itemTemplate = roadmap_item_html
            let items = jsonDataInfo.roadmap.items;

            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                // Chiamata al metodo che abbiamo scritto precedentemente per i singoli item
                roadmapHtml += await HtmlBuilder.ReplaceKeysDataInfoOfRoadmapItems(itemTemplate, item);
            }

            string = HtmlBuilder.RepleaceAllKey(string, "roadmap_items", roadmapHtml);
        } else {
            string = HtmlBuilder.RepleaceAllKey(string, "roadmap_items", "<p class='no-data'>No roadmap items available.</p>");
        }

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