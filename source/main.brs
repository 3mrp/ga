sub Main()
    ' Initialize the app
    print "Starting Roku Browser App"
    
    ' Create the main screen
    screen = CreateObject("roSGScreen")
    m.port = CreateObject("roMessagePort")
    screen.setMessagePort(m.port)
    
    ' Create the scene
    scene = screen.CreateScene("BrowserScene")
    screen.show()
    
    ' Main event loop
    while true
        msg = wait(0, m.port)
        msgType = type(msg)
        
        if msgType = "roSGScreenEvent"
            if msg.isScreenClosed() then
                return
            end if
        end if
    end while
end sub
