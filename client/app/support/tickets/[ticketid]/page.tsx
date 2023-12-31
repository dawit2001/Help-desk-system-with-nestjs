"use client";
import PageHero from "@/Components/PageHero";
import DOMPurify, { SanitizeElementHookEvent } from "dompurify";
import {
  Attachement,
  Ticket,
  deleteTicketStart,
  fetchAttachmentFaliure,
  fetchAttachmentStart,
  fetchTicketFaliure,
  fetchTicketStart,
  selectTicket,
} from "@/app/Redux/features/ticketSlice";
import { selectUser } from "@/app/Redux/features/userSlice";
import React, { useEffect, useState } from "react";
import { BsLink, BsPencil, BsTicket, BsTrash } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { LiaTimesSolid } from "react-icons/lia";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { is } from "date-fns/locale";
import EditTicket from "@/Components/EditTicket";
let sanitaizeContent: string;
const api =
  process.env.NEXT_PUBLIC_REACT_ENV === "PRODUCTION"
    ? "https://kns-support-api.onrender.com"
    : "http://localhost:8000";
const TicketIdPage = ({ params }: { params: { ticketid: string } }) => {
  const { error, Loading } = useSelector(selectTicket);
  const { user } = useSelector(selectUser);
  const [open, setOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [successDelete, setSuccessDelete] = useState(false);
  const [ticket, setTicket] = useState<Ticket | undefined>({
    Id: "",
    IssueType: "",
    Email: user?.Email,
    Subject: "",
    Content: "",
    Priority: "",
    Status: "",
    UserId: user?.Id,
    CreatedAt: new Date(),
  });
  const [attachment, setAttachment] = useState<Attachement[]>();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`${api}/ticket/${params.ticketid}`);
        const ticket = await response.data;
        const {
          Id,
          Type: IssueType,
          Email,
          Subject,
          Content,
          Priority,
          UserId,
          CreatedAt,
          Status,
        } = ticket;
        console.log(ticket);
        setTicket({
          Id,
          IssueType,
          Email,
          Subject,
          Content,
          Priority,
          UserId,
          Status,
          CreatedAt,
        });
        const attachResponse = await axios.get(
          `${api}/ticket/attachment/${params.ticketid}`
        );
        const attach = await attachResponse.data;
        setAttachment(attach);
      } catch (e: any) {
        dispatch(fetchTicketFaliure(e.response.data.message));
        dispatch(fetchAttachmentFaliure(e.response.data.message));
      }
    };
    fetchTicket();
  }, [user]);
  useEffect(() => {}, [error, Loading]);
  const handleClick = () => {
    dispatch(deleteTicketStart(params.ticketid));
    setIsValid(true);
  };
  useEffect(() => {
    if (isValid && !Loading && error !== null) {
      setShowError(true);
      setSuccessDelete(false);
    }
    if (isValid && !Loading && error === null) {
      setShowError(false);
      setSuccessDelete(true);
      setTimeout(() => {
        setSuccessDelete(false);
        router.push("/support/tickets");
      }, 1000);
    }
  }, [error, Loading, isValid]);
  const handleBackground = (Status?: string) => {
    let background: string = "";
    if (Status === "Open") background = "bg-green-600";
    else if (Status === "Pending") background = "bg-gray-600";
    else if (Status === "Closed") background = "bg-red-600";
    else if (Status === "Resolved") background = "bg-blue-400";
    return background;
  };

  return (
    <>
      <div className="w-full h-full flex flex-col ">
        <PageHero
          pageTitle="Ticket"
          currentLink="ticketTitle"
          Links={[
            { link: "Home", href: "/support/" },
            { link: "tickets", href: "/support/tickets" },
          ]}
          Icon={<BsTicket className="md:text-5xl text-2xl text-slate-50" />}
        />
        <div className="md:px-20 h-full md:p-10 p-1 w-full ">
          <div className="bg-white md:p-10 rounded-lg flex flex-col gap-5 ">
            <Snackbar
              open={successDelete}
              autoHideDuration={1000}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert severity="success" sx={{ width: "100%" }}>
                Successfully Deleted
              </Alert>
            </Snackbar>
            {error && showError && (
              <div className="p-3 border bg-red-200 border-red-400 flex justify-between">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <button
                  className="text-lg text-gray-800"
                  onClick={() => {
                    setIsValid(false);
                    setShowError(false);
                  }}
                >
                  <LiaTimesSolid />
                </button>
              </div>
            )}
            <div className="flex justify-between">
              <div className="flex gap-1">
                <span
                  className={`self-center m-1 md:w-[15px] md:h-[15px] w-[10px] h-[10px] text-blue border-inherit border  md:rounded-md rounded-sm ${handleBackground(
                    ticket?.Status
                  )}`}
                ></span>
                <h1 className="md:text-lg text-sm text-gray-600 self-center font-medium">
                  {ticket?.Status}
                </h1>
              </div>
              <div className="flex  self-end">
                <button
                  className=" md:flex gap-2 border-blue-300 border hover:shadow-sm hover:shadow-blue-400 bg-slate-50 p-2 rounded-l-lg "
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  <BsPencil className="md:text-xl text-sm text-gray-500" />
                </button>
                <button
                  className=" md:flex gap-2 border-blue-300 border hover:shadow-sm hover:shadow-blue-400 bg-slate-50 p-2 rounded-r-lg "
                  onClick={handleClick}
                >
                  <BsTrash className="md:text-xl text-sm text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-3 border w-full">
              <p className="text-xl text-gray-800  text-center  font-bold underline w-[90%] break-words">
                {ticket?.Subject}
              </p>
              <div
                dangerouslySetInnerHTML={{ __html: ticket?.Content || " " }}
                className="w-full break-words"
              ></div>
            </div>
            {attachment && attachment.length !== 0 && (
              <div className="flex flex-col gap-5 ">
                <p className="text-sm font-semibold text-gray-700 self-center">
                  Attachments
                </p>
                <>
                  {attachment.map((file) => (
                    <div className="flex gap-5" key={file.Id}>
                      <BsLink className="md:text-xl text-[12px] text-gray-600 self-center" />
                      <a
                        href={`${file.FilePath}`}
                        download={file.FileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-[90%] text-sm font-medium text-blue-500 hover:text-gray-600 break-words"
                      >
                        {file.FileName}
                      </a>
                    </div>
                  ))}
                </>
              </div>
            )}
          </div>
        </div>
      </div>
      {open && (
        <EditTicket
          setOpen={setOpen}
          open={open}
          Ticket={ticket}
          Attachment={attachment}
        />
      )}
    </>
  );
};

export default TicketIdPage;
