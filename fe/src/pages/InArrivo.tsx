import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { Button, Container, Flex, Heading, Text } from '@radix-ui/themes'
import { Link } from 'react-router'

// Segnaposto per le pagine della navbar non ancora realizzate
export function InArrivo() {
  return (
    <Container size="2" px="4" py="9">
      <Flex direction="column" align="center" gap="4" style={{ textAlign: 'center' }}>
        <Heading size="8">Pagina in costruzione</Heading>
        <Text color="gray">Questa sezione arrivera' a breve.</Text>
        <Button asChild variant="soft">
          <Link to="/">
            <ArrowLeftIcon /> Torna alla home
          </Link>
        </Button>
      </Flex>
    </Container>
  )
}
