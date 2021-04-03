import './App.css'
import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Pusher from 'pusher-js'
import axios from './axios'

const App = () => {
    const [messages, setMessages] = useState([])

    useEffect(() => {
        //fetching the initial information
        axios.get('/messages/sync').then((response) => {
            setMessages(response.data)
        })
    }, [])

    useEffect(() => {
        var pusher = new Pusher('b9fea509874c79644820', {
            cluster: 'ap2',
        })

        var channel = pusher.subscribe('messages')
        channel.bind('inserted', (newMessage) => {
            alert(JSON.stringify(newMessage))
            setMessages([...messages, newMessage])
        })

        return () => {
            channel.unbind_all()
            channel.unsubscribe()
        }
    }, [messages])

    console.log(messages)

    return (
        <div className="app">
            <div className="app__body">
                <Sidebar />
                <Chat />
            </div>
        </div>
    )
}

export default App
