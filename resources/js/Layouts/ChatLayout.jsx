import ConversationItem from '@/Components/App/ConversationItem';
import TextInput from '@/Components/TextInput';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const ChatLayout = ({children}) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});

    const isUserOnline = (userId) => onlineUsers[userId];

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        )
    } 

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                //logic to the block: the blocked users are shown on bottom and the blocked user are shown by admin only
                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }
                //logic to the last message date: the last message is on top
                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        )
    }, [localConversations]);

    useEffect(() => {
        setLocalConversations(conversations)
    }, [conversations]);

    useEffect(() => {
        Echo.join('online')// with 3 we can control who is online right now 
            //if i connect to channel, i will get all users here
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );

                setOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUsersObj};
                });
            })
            //joining: ever somebody connect to the channel, that user will come right here
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                })
            })
            //leaving: ever somebody leave that channel, i will get information right here
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                })
            })
            .error((error) => {
                console.log('error', error)
            })
        return () => {
            Echo.leave("online");
        }
    })

    return (
        <>
            <div className='flex-1 w-full flex overflow-hidden'>
                <div 
                    className={`transition-all w-full sm:w-[220px] md:w-[300px] bg-slate-800 flex flex-col overflow-hidden ${
                        selectedConversation ? "-ml-[100%] sm:ml-0" : ""
                    }`}
                >
                    <div className='flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200'>
                        My Conversations
                        <div
                            className='tooltip tooltip-left' data-tip='Create new Group'
                        >
                            <button className='text-gray-400 hover:text-gray-200'>
                                <PencilSquareIcon className='w-4 h-4 inline-block ml-2' />
                            </button>
                        </div>
                    </div>
                    <div className='p-3'>
                        <TextInput 
                            onKeyUp={onSearch}
                            placeholder="Filter users and groups"
                            className='w-full'
                        />
                    </div>
                    <div className='flex-1 overflow-auto'>
                        {sortedConversations &&
                            sortedConversations.map((conversation) => (
                                <ConversationItem 
                                    key={`${
                                        conversation.is_group 
                                            ? "group_"
                                            :"user_"
                                    }${conversation.id}`}
                                    conversation={conversation}
                                    online={!!isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversation}
                                />
                            ))
                        }
                    </div>
                    
                </div>
                <div className='flex-1 flex flex-col overflow-hidden'>
                    {children}
                </div>
            </div>
        </>
  )
}

export default ChatLayout