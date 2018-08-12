# Talia Peer Exchange Protocol Server

## Abstract

TPEXS (Talia Peer Exchange Protocol Server) is a server dedicated to exchange peer's information like IP and Port, and Group Messages and notes.
The server is designed to hold large number of Network Groups and exchange peer information among the peers in the same group.
Each peer can create new group, to join groups or to leave groups. Peer can be any device that is connected to the internet and has unique MAC and IP address.
Each peer retrieves its own Peer Unique Identification Number (PUIN) and Peer Access Code (PAC) from the server. By the combination of PIC & PAC the peer can be recognized in the TPEXS and exchange information securely.
The server exchanges the following information: The Group Data: (Group Name, Creation Date, Number of peers connected, log) and the Peers Data (IP, Port, Name, PUIN).

Talia Server can be useful for many applications that are fully distributed (DAPPS), for Dedicated servers without fixed IP on cloud systems or complex machines in cloud systems all over the world. For mobile devices and applications. IoT can also be one of the things that can get help from such server, it will help them recognize and create shared group and communicate with each other.
The server is not acting as mediator, and is not the route to send packets, it is only a safer way to know about other peers in the same network. From then on it is the duty of the software to connect with each other and to handle information.
TPEXS cannot distinguish real time if one of the devices has disconnected from the network. So, the software must handle verification and signaling to the other peers that has been received by the server.