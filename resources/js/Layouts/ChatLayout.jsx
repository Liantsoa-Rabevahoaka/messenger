import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const ChatLayout = ({children}) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;

    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);

    useEffect(() => {
        Echo.join('online')// with 3 we can control who is online right now 
            //if i connect to channel, i will get all users here
            .here((users) => {
                console.log("here", users)
            })
            //joining: ever somebody connect to the channel, that user will come right here
            .joining((user) => {
                console.log("joining", user)
            })
            //leaving: ever somebody leave that channel, i will get information right here
            .leaving((user) => {
                console.log("leaving", user)
            })
            .error((error) => {
                console.log('error', error)
            })
    })

    return (
        <>
            ChatLayout
            <div>{children}</div>
        </>
  )
}

export default ChatLayout