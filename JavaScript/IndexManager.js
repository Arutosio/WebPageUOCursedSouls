export default class IndexManager
{
    // constructor(value) 
    // {
    //     this.value = value
    // }

    static InjecHtmlContentToTheEnd(elementId, content) 
    { // Add content to the end
        let retBool = true;
        if(document.getElementById(elementId))
        {
            try {
                document.getElementById(elementId).innerHTML += content;
            } catch (error) {
                retBool = false;
                console.error(error);
            }
        }
        return retBool
    }

    static InjecMarkdown(insideIn, markdownStr) 
    {
        let retBool = false
        return retBool
    }

    static ReplaceHtmlContent(elementId, content) 
    {
        let retBool = true;
        if(document.getElementById(elementId))
        {
            try {
                document.getElementById(elementId).innerHTML = content;
            } catch (error) {
                retBool = false;
                console.error(error);
            }
        }
        return retBool
    }

    static FindTabByElement(tabs, el) {
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].tabI === el) {
                return tabs[i];
            }
        }
        return null;
    }

    static GetValuesFromNewPostDetail() 
    {
        document.getElementById(elementId).innerHTML =content;
    }
    
    static GetValuesFromNewComment() 
    {

    }
}

