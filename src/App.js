import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Button, Divider, Flex, FormControl, Heading, Input, Link, Spinner, Text } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x693F885F0CF1adDDD801a252B909AB91Bfd23B4f";

function App() {
    const [greeting, setGreetingValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [windowETH, setWindowETH] = useState(false);

    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            setWindowETH(true);
        }
    }, []);

    async function requestAccount() {
        await window.ethereum.request({ method: "eth_requestAccounts" });
    }

    async function fetchGreeting() {
        if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, Greeter.abi, provider);
            try {
                const data = await contract.greet();
                setGreetingValue(data);
                setLoading(false);
            } catch (err) {
                console.log("Error ", err);
            }
        } else {
            console.log("Sorry!");
        }
    }

    async function setGreeting() {
        if (!greeting) return;
        if (typeof window.ethereum !== "undefined") {
            setLoading(true);
            await requestAccount();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, Greeter.abi, signer);
            const transaction = await contract.setGreeting(greeting);
            setGreetingValue("");
            await transaction.wait();
            await fetchGreeting();
        }
    }

    function greetingInput(e) {
        setGreetingValue(e.target.value);
    }

    return (
        <div className="container">
            {windowETH ? (
                <>
                    <Box w="80%" p={3}>
                        <Heading as="h1" size="2xl" isTruncated p={6}>
                            Greetings from Contract
                        </Heading>
                        <Divider />
                        <FormControl pt={10} pb={10}>
                            <Flex>
                                <Box w={"100%"} pr={2}>
                                    <Input value={greeting} id="greeting" type="text" placeholder="Greeting Message" onChange={greetingInput} />
                                </Box>
                                <Box>
                                    <Button onClick={setGreeting}>Set Greeting</Button>
                                </Box>
                            </Flex>
                        </FormControl>
                        <Divider mb={10} />
                        {loading ? (
                            <Spinner />
                        ) : (
                            <>
                                <Button onClick={fetchGreeting}>Fetch Greeting</Button>
                                <Text isTruncated m={12}>
                                    {greeting && <>Value from Contract: {greeting}</>}
                                </Text>
                            </>
                        )}
                        <Text color="gray.500" isTruncated m={12} as="kbd">
                            <br /> Contract Address:
                            <Link href={`https://ropsten.etherscan.io/address/${CONTRACT_ADDRESS}`} isExternal>
                                {" "}
                                {CONTRACT_ADDRESS} <ExternalLinkIcon mx="12px" />
                            </Link>
                        </Text>
                    </Box>
                </>
            ) : (
                <Text fontSize="2xl" color="red" isTruncated as="kbd">
                    MetaMask not available! <br /> Install the extension for your browser!
                </Text>
            )}
        </div>
    );
}

export default App;
