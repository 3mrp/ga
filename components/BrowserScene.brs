sub init()
    m.top.setFocus(true)
    
    ' Get UI elements
    m.urlLabel = m.top.findNode("urlLabel")
    m.contentLabel = m.top.findNode("contentLabel")
    m.statusLabel = m.top.findNode("statusLabel")
    m.helpText = m.top.findNode("helpText")
    m.backButton = m.top.findNode("backButton")
    m.forwardButton = m.top.findNode("forwardButton")
    m.refreshButton = m.top.findNode("refreshButton")
    
    ' Initialize browser state
    m.currentUrl = ""
    m.history = []
    m.historyIndex = -1
    m.scrollPosition = 0
    m.contentLines = []
    
    ' Set up keyboard observer
    m.keyboard = CreateObject("roSGNode", "Keyboard")
    
    ' Set key event handler
    m.top.observeField("focusedChild", "onFocusChange")
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    if press
        if key = "OK"
            ' Show keyboard for URL input
            showKeyboard()
            return true
        else if key = "left"
            ' Go back
            navigateBack()
            return true
        else if key = "right"
            ' Go forward
            navigateForward()
            return true
        else if key = "replay"
            ' Refresh current page
            if m.currentUrl <> ""
                fetchContent(m.currentUrl)
            end if
            return true
        else if key = "up"
            ' Scroll up
            scrollContent(-50)
            return true
        else if key = "down"
            ' Scroll down
            scrollContent(50)
            return true
        end if
    end if
    return false
end function

sub showKeyboard()
    ' Create and show keyboard dialog
    m.keyboardDialog = CreateObject("roSGNode", "KeyboardDialog")
    m.keyboardDialog.title = "Enter URL or Search Term"
    m.keyboardDialog.text = m.currentUrl
    m.keyboardDialog.buttons = ["OK", "Cancel"]
    m.keyboardDialog.observeField("buttonSelected", "onKeyboardButton")
    m.top.dialog = m.keyboardDialog
end sub

sub onKeyboardButton(event as Object)
    buttonIndex = m.keyboardDialog.buttonSelected
    if buttonIndex = 0
        ' OK pressed
        inputText = m.keyboardDialog.text
        if inputText <> ""
            processInput(inputText)
        end if
    end if
    m.top.dialog = invalid
end sub

sub processInput(inputText as String)
    ' Process user input - could be URL or search term
    url = inputText
    
    ' If it doesn't start with http, add https://
    if not url.Left(7) = "http://" and not url.Left(8) = "https://"
        ' Check if it looks like a domain
        if url.Instr(".") > 0 and url.Instr(" ") < 0
            url = "https://" + url
        else
            ' Treat as search query - use DuckDuckGo
            ' Encode the search term properly
            encodedQuery = inputText.EncodeUriComponent()
            url = "https://duckduckgo.com/?q=" + encodedQuery
        end if
    end if
    
    loadUrl(url)
end sub

sub loadUrl(url as String)
    m.statusLabel.text = "Loading: " + url
    m.helpText.visible = false
    
    ' Add to history
    if m.historyIndex < m.history.Count() - 1
        ' Remove forward history if we're not at the end
        ' Create new array with only history up to current index
        newHistory = []
        for i = 0 to m.historyIndex
            newHistory.Push(m.history[i])
        end for
        m.history = newHistory
    end if
    m.history.Push(url)
    m.historyIndex = m.history.Count() - 1
    
    m.currentUrl = url
    m.urlLabel.text = url
    
    ' Fetch the content
    fetchContent(url)
end sub

sub fetchContent(url as String)
    ' Fetch content without modifying history
    m.statusLabel.text = "Loading: " + url
    
    ' Fetch content
    transfer = CreateObject("roUrlTransfer")
    transfer.SetUrl(url)
    transfer.SetCertificatesFile("common:/certs/ca-bundle.crt")
    transfer.InitClientCertificates()
    ' Note: SSL verification is disabled to maximize compatibility with various websites
    ' Many sites have certificate chains that Roku's certificate bundle doesn't recognize
    ' Users should be aware this makes connections less secure
    transfer.EnableHostVerification(false)
    transfer.EnablePeerVerification(false)
    
    ' Set user agent
    transfer.AddHeader("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) Roku/Browser 1.0")
    
    ' Try to fetch the content
    port = CreateObject("roMessagePort")
    transfer.SetPort(port)
    
    if transfer.AsyncGetToString()
        while true
            msg = wait(5000, port)
            if msg <> invalid
                if type(msg) = "roUrlEvent"
                    if msg.GetResponseCode() = 200
                        content = msg.GetString()
                        displayContent(content, url)
                        m.statusLabel.text = "Loaded: " + url
                    else
                        m.statusLabel.text = "Error loading page: HTTP " + msg.GetResponseCode().ToStr()
                        m.contentLabel.text = "Failed to load page. Response code: " + msg.GetResponseCode().ToStr()
                    end if
                    exit while
                end if
            else
                m.statusLabel.text = "Error: Request timeout"
                m.contentLabel.text = "Request timed out. Please try again."
                exit while
            end if
        end while
    else
        m.statusLabel.text = "Error: Failed to initiate request"
        m.contentLabel.text = "Failed to start request. Please check the URL."
    end if
end sub

sub displayContent(content as String, url as String)
    ' Enhanced HTML rendering with basic formatting support
    cleanContent = content
    
    ' Remove scripts
    cleanContent = removeTagContent(cleanContent, "<script", "</script>")
    
    ' Extract and parse basic CSS for color/styling hints
    cleanContent = removeTagContent(cleanContent, "<style", "</style>")
    
    ' Replace common HTML entities
    cleanContent = replaceHTMLEntities(cleanContent)
    
    ' Apply basic HTML formatting before removing tags
    cleanContent = applyHTMLFormatting(cleanContent)
    
    ' Remove remaining HTML tags
    cleanContent = stripHtmlTags(cleanContent)
    
    ' Clean up extra whitespace
    while cleanContent.Instr("  ") >= 0
        cleanContent = cleanContent.Replace("  ", " ")
    end while
    
    ' Split into lines and clean
    lines = cleanContent.Split(Chr(10))
    processedLines = []
    for each line in lines
        trimmed = line.Trim()
        if trimmed <> ""
            processedLines.Push(trimmed)
        end if
    end for
    
    ' Limit to first 1000 lines to prevent memory issues
    if processedLines.Count() > 1000
        processedLines = processedLines.Slice(0, 1000)
        processedLines.Push("")
        processedLines.Push("[Content truncated - showing first 1000 lines]")
    end if
    
    m.contentLines = processedLines
    m.scrollPosition = 0
    updateContentDisplay()
end sub

function stripHtmlTags(html as String) as String
    result = ""
    inTag = false
    
    for i = 0 to html.Len() - 1
        char = html.Mid(i, 1)
        if char = "<"
            inTag = true
        else if char = ">"
            inTag = false
            ' Add space after closing tag
            result = result + " "
        else if not inTag
            result = result + char
        end if
    end for
    
    return result
end function

' Helper function to remove content between tags (with safety limit)
function removeTagContent(content as String, startTag as String, endTag as String) as String
    result = content
    iterations = 0
    maxIterations = 100 ' Safety limit
    
    while iterations < maxIterations
        tagStart = result.Instr(startTag)
        if tagStart < 0 then exit while
        
        tagEnd = result.Instr(tagStart, endTag)
        if tagEnd < 0 then exit while
        
        ' Remove the tag and its content
        result = result.Left(tagStart) + result.Mid(tagEnd + endTag.Len())
        iterations = iterations + 1
    end while
    
    return result
end function

' Replace common HTML entities
function replaceHTMLEntities(content as String) as String
    result = content
    result = result.Replace("&nbsp;", " ")
    result = result.Replace("&amp;", "&")
    result = result.Replace("&lt;", "<")
    result = result.Replace("&gt;", ">")
    result = result.Replace("&quot;", Chr(34))
    result = result.Replace("&#39;", "'")
    result = result.Replace("&mdash;", "—")
    result = result.Replace("&ndash;", "–")
    result = result.Replace("&hellip;", "...")
    result = result.Replace("&copy;", "©")
    result = result.Replace("&reg;", "®")
    result = result.Replace("&trade;", "™")
    result = result.Replace("&bull;", "•")
    result = result.Replace("&middot;", "·")
    return result
end function

' Apply basic HTML formatting before stripping tags
function applyHTMLFormatting(html as String) as String
    result = html
    
    ' Add visual separators for headings
    result = replaceTagWithFormat(result, "<h1", "</h1>", Chr(10) + "━━━ ", " ━━━" + Chr(10))
    result = replaceTagWithFormat(result, "<h2", "</h2>", Chr(10) + "═══ ", " ═══" + Chr(10))
    result = replaceTagWithFormat(result, "<h3", "</h3>", Chr(10) + "─── ", " ───" + Chr(10))
    result = replaceTagWithFormat(result, "<h4", "</h4>", Chr(10) + "╌╌ ", " ╌╌" + Chr(10))
    result = replaceTagWithFormat(result, "<h5", "</h5>", Chr(10) + "▸ ", "" + Chr(10))
    result = replaceTagWithFormat(result, "<h6", "</h6>", Chr(10) + "▹ ", "" + Chr(10))
    
    ' Format text styling
    result = replaceTagWithFormat(result, "<strong", "</strong>", "【", "】")
    result = replaceTagWithFormat(result, "<b", "</b>", "【", "】")
    result = replaceTagWithFormat(result, "<em", "</em>", "⟪", "⟫")
    result = replaceTagWithFormat(result, "<i", "</i>", "⟪", "⟫")
    result = replaceTagWithFormat(result, "<code", "</code>", "`", "`")
    result = replaceTagWithFormat(result, "<pre", "</pre>", Chr(10) + "```" + Chr(10), Chr(10) + "```" + Chr(10))
    
    ' Format links
    result = replaceTagWithFormat(result, "<a", "</a>", "[🔗 ", "]")
    
    ' Format lists
    result = replaceTagWithFormat(result, "<li", "</li>", Chr(10) + "  • ", "")
    result = replaceTagWithFormat(result, "<ul", "</ul>", Chr(10), Chr(10))
    result = replaceTagWithFormat(result, "<ol", "</ol>", Chr(10), Chr(10))
    
    ' Format blocks
    result = replaceTagWithFormat(result, "<p", "</p>", "", Chr(10) + Chr(10))
    result = replaceTagWithFormat(result, "<div", "</div>", "", Chr(10))
    result = replaceTagWithFormat(result, "<br", ">", Chr(10), "")
    result = result.Replace("<br/>", Chr(10))
    result = result.Replace("<br />", Chr(10))
    result = replaceTagWithFormat(result, "<hr", ">", Chr(10) + "─────────────────────" + Chr(10), "")
    result = replaceTagWithFormat(result, "<blockquote", "</blockquote>", Chr(10) + "│ ", Chr(10))
    
    ' Format tables (basic support)
    result = replaceTagWithFormat(result, "<th", "</th>", " ║ ", " ║ ")
    result = replaceTagWithFormat(result, "<td", "</td>", " │ ", " │ ")
    result = replaceTagWithFormat(result, "<tr", "</tr>", "", Chr(10))
    result = replaceTagWithFormat(result, "<table", "</table>", Chr(10) + "┌─────────┐" + Chr(10), Chr(10) + "└─────────┘" + Chr(10))
    
    return result
end function

' Replace a tag pair with prefix/suffix formatting
function replaceTagWithFormat(html as String, startTag as String, endTag as String, prefix as String, suffix as String) as String
    result = html
    iterations = 0
    maxIterations = 200 ' Safety limit
    
    while iterations < maxIterations
        tagStart = result.Instr(startTag)
        if tagStart < 0 then exit while
        
        ' Find the end of the opening tag
        tagOpenEnd = result.Instr(tagStart, ">")
        if tagOpenEnd < 0 then exit while
        
        ' Find the closing tag
        tagCloseStart = result.Instr(tagOpenEnd, endTag)
        if tagCloseStart < 0
            ' No closing tag, just remove opening tag
            result = result.Left(tagStart) + result.Mid(tagOpenEnd + 1)
            iterations = iterations + 1
            goto continueReplace
        end if
        
        ' Extract content between tags
        content = result.Mid(tagOpenEnd + 1, tagCloseStart - tagOpenEnd - 1)
        
        ' Build replacement
        replacement = prefix + content + suffix
        
        ' Replace in original string
        result = result.Left(tagStart) + replacement + result.Mid(tagCloseStart + endTag.Len())
        
        iterations = iterations + 1
        continueReplace:
    end while
    
    return result
end function

sub updateContentDisplay()
    ' Display a window of content based on scroll position
    visibleLines = 40 ' Approximate number of visible lines
    startLine = m.scrollPosition
    if startLine < 0 then startLine = 0
    if startLine >= m.contentLines.Count() then startLine = m.contentLines.Count() - 1
    
    endLine = startLine + visibleLines
    if endLine > m.contentLines.Count() then endLine = m.contentLines.Count()
    
    displayText = ""
    for i = startLine to endLine - 1
        if i < m.contentLines.Count()
            displayText = displayText + m.contentLines[i] + Chr(10)
        end if
    end for
    
    m.contentLabel.text = displayText
    
    ' Update status with scroll info
    if m.contentLines.Count() > visibleLines
        scrollPercent = (startLine * 100) / (m.contentLines.Count() - visibleLines)
        if scrollPercent > 100 then scrollPercent = 100
        m.statusLabel.text = m.currentUrl + " | Scroll: " + scrollPercent.ToStr() + "%"
    else
        m.statusLabel.text = m.currentUrl
    end if
end sub

sub scrollContent(delta as Integer)
    if m.contentLines.Count() > 0
        m.scrollPosition = m.scrollPosition + (delta / 20) ' Adjust scroll speed
        if m.scrollPosition < 0 then m.scrollPosition = 0
        maxScroll = m.contentLines.Count() - 40
        if maxScroll < 0 then maxScroll = 0
        if m.scrollPosition > maxScroll then m.scrollPosition = maxScroll
        updateContentDisplay()
    end if
end sub

sub navigateBack()
    if m.historyIndex > 0
        m.historyIndex = m.historyIndex - 1
        url = m.history[m.historyIndex]
        m.currentUrl = url
        m.urlLabel.text = url
        fetchContent(url)
    else
        m.statusLabel.text = "Already at the beginning of history"
    end if
end sub

sub navigateForward()
    if m.historyIndex < m.history.Count() - 1
        m.historyIndex = m.historyIndex + 1
        url = m.history[m.historyIndex]
        m.currentUrl = url
        m.urlLabel.text = url
        fetchContent(url)
    else
        m.statusLabel.text = "Already at the end of history"
    end if
end sub

sub onFocusChange()
    ' Handle focus changes if needed
end sub
