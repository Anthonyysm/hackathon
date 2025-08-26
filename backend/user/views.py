from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from .models import CustomUser


@api_view(['POST'])
def create_user_view(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    type_ = data.get('type')
    birth = data.get('birth')
    phone = data.get('phone')
    crp = data.get('crp') if type_ == 'psychologist' else None

    errors = []

    if not all([name, email, username, password, type_, birth, phone]):
        errors.append('Todos os campos obrigatórios devem ser preenchidos.')

    try:
        birth_date = date.fromisoformat(birth)  # ISO format (ex: '1990-05-12')
        today = date.today()

        if birth_date > today:
            errors.append('A data de nascimento não pode estar no futuro.')

        age = (
            today.year
            - birth_date.year
            - ((today.month, today.day) < (birth_date.month, birth_date.day))
        )

        if birth_date.year < today.year - 120:
            errors.append('A data de nascimento é muito antiga.')

        if age < 18:
            errors.append('Você precisa ter pelo menos 18 anos.')

    except (ValueError, TypeError):
        errors.append('Formato de data de nascimento inválido.')

    if type_ == 'psychologist' and not crp:
        errors.append('O campo CRP é obrigatório para psicólogos.')

    if CustomUser.objects.filter(email=email).exists():
        errors.append('Este e-mail já está em uso.')

    if CustomUser.objects.filter(username=username).exists():
        errors.append('Este username já está em uso.')

    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.create_user(
        name=name,
        email=email,
        username=username,
        password=password,
        type=type_,
        birth=birth_date,
        phone=phone,
        crp=crp,
    )

    return Response(
        {'message': 'Usuário criado com sucesso!'},
        status=status.HTTP_201_CREATED,
    )


@api_view(['PUT'])
def update_user_view(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        data = request.data
        errors = []

        name = data.get('name', user.name)
        email = data.get('email', user.email)
        username = data.get('username', user.username)
        phone = data.get('phone', user.phone)
        type_ = data.get('type', user.type)

        if (
            email != user.email
            and CustomUser.objects.filter(email=email).exists()
        ):
            errors.append('Este e-mail já está em uso.')

        # Verificar se username já existe (excluindo o usuário atual)
        if (
            username != user.username
            and CustomUser.objects.filter(username=username).exists()
        ):
            errors.append('Este username já está em uso.')

        # Validação de data de nascimento se for fornecida
        birth = data.get('birth')
        if birth:
            try:
                birth_date = date.fromisoformat(birth)
                today = date.today()

                if birth_date > today:
                    errors.append(
                        'A data de nascimento não pode estar no futuro.'
                    )

                age = (
                    today.year
                    - birth_date.year
                    - (
                        (today.month, today.day)
                        < (birth_date.month, birth_date.day)
                    )
                )

                if birth_date.year < today.year - 120:
                    errors.append('A data de nascimento é muito antiga.')

                if age < 18:
                    errors.append('Você precisa ter pelo menos 18 anos.')

            except (ValueError, TypeError):
                errors.append('Formato de data de nascimento inválido.')
        else:
            birth_date = user.birth

        if errors:
            return Response(
                {'errors': errors}, status=status.HTTP_400_BAD_REQUEST
            )

        # Atualizar os campos do usuário
        user.name = name
        user.email = email
        user.username = username
        user.phone = phone
        user.type = type_

        if birth:
            user.birth = birth_date

        password = data.get('password')
        if password:
            user.set_password(password)

        user.save()

        return Response(
            {'message': 'Usuário atualizado com sucesso!'},
            status=status.HTTP_200_OK,
        )

    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado.'},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(['DELETE'])
def delete_user_view(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        user.delete()
        return Response(
            {'message': 'Usuário deletado com sucesso!'},
            status=status.HTTP_200_OK,
        )
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado.'},
            status=status.HTTP_404_NOT_FOUND,
        )
