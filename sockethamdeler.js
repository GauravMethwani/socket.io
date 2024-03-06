// sockethandler.js
module.exports = function handleSocketConnections(io, sessionMiddleware, onlineUsers, User) {
    io.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });
  
    io.on('connection', (socket) => {
      const session = socket.request.session;
  
      if (session && session.userId) {
        // Mark user as online
        onlineUsers.add(session.userId);
  
        // Emit the updated online users list to the connected client
        io.emit('updateOnlineUsers', Array.from(onlineUsers));
  
        // Broadcast user status changes to other clients
        socket.broadcast.emit(`updateUserStatus_${session.userId}`, { userId: session.userId, status: 'online' });
  
        socket.on('disconnect', () => {
          // Mark user as offline
          onlineUsers.delete(session.userId);
  
          // Broadcast the user status change to other clients
          socket.broadcast.emit(`updateUserStatus_${session.userId}`, { userId: session.userId, status: 'offline' });
  
          // Update the user's status to 'offline' in the database
          User.findByIdAndUpdate(
            session.userId,
            { $set: { status: 'offline' } },
            { new: true },
            (err, user) => {
              if (err) {
                console.error('Error updating user status:', err);
                // Handle the error appropriately
              } else {
                console.log('User status updated:', user);
              }
            }
          );
        });
      }
    });
  };
  