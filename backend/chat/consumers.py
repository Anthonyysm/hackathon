import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
# entrar
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
# sair
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
# receber
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Enviar mnsg pra sala
        await self.channel_leyer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )
    
    # Receber mnsg do grupo
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))